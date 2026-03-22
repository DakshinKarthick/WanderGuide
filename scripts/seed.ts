/**
 * WanderGuide — CSV Seed Pipeline
 *
 * Reads 3 CSV datasets and produces a single `supabase/seed.sql` file
 * that can be pasted into the Supabase SQL Editor.
 *
 * Usage:  npx tsx scripts/seed.ts
 * Output: supabase/seed.sql
 *
 * Pipeline:
 *  1. indian-cities.csv        → INSERT INTO cities
 *  2. tourism-atlas.csv        → INSERT INTO destinations (base)
 *  3. tourist-destinations.csv → UPDATE destinations (enrich metadata)
 *  4. Curated events           → INSERT INTO events
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// ── helpers ──────────────────────────────────────────────────────────

/** Simple CSV parser — handles quoted fields with commas */
function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h.trim()] = (values[i] ?? '').trim(); });
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === ',' && !inQuotes) { result.push(current); current = ''; continue; }
    current += char;
  }
  result.push(current);
  return result;
}

/** Escape single quotes for SQL */
function esc(s: string): string {
  return s.replace(/'/g, "''");
}

// ── state normalisation ──────────────────────────────────────────────

const STATE_FIXES: Record<string, string> = {
  'maharastra': 'Maharashtra',
  'maharahtra': 'Maharashtra',
  'gujrat': 'Gujarat',
  'karanataka': 'Karnataka',
  'pondicherry': 'Puducherry',
  'andaman and nicobar islands': 'Andaman and Nicobar',
  'chandigarh': 'Chandigarh',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli',
  'lakshadweep': 'Lakshadweep',
};

function normalizeState(s: string): string {
  const trimmed = s.trim();
  return STATE_FIXES[trimmed.toLowerCase()] ?? trimmed;
}

// ── state → region lookup ────────────────────────────────────────────

const REGION_MAP: Record<string, string> = {
  'Delhi': 'north', 'Haryana': 'north', 'Himachal Pradesh': 'north',
  'Jammu and Kashmir': 'north', 'Ladakh': 'north', 'Punjab': 'north',
  'Rajasthan': 'north', 'Uttarakhand': 'north', 'Chandigarh': 'north',

  'Andhra Pradesh': 'south', 'Karnataka': 'south', 'Kerala': 'south',
  'Tamil Nadu': 'south', 'Telangana': 'south', 'Puducherry': 'south',

  'Bihar': 'east', 'Jharkhand': 'east', 'Odisha': 'east', 'West Bengal': 'east',

  'Goa': 'west', 'Gujarat': 'west', 'Maharashtra': 'west',
  'Daman and Diu': 'west', 'Dadra and Nagar Haveli': 'west',

  'Chhattisgarh': 'central', 'Madhya Pradesh': 'central', 'Uttar Pradesh': 'central',

  'Arunachal Pradesh': 'northeast', 'Assam': 'northeast', 'Manipur': 'northeast',
  'Meghalaya': 'northeast', 'Mizoram': 'northeast', 'Nagaland': 'northeast',
  'Sikkim': 'northeast', 'Tripura': 'northeast',

  // Islands & UTs — sensible fallbacks
  'Andaman and Nicobar': 'south',
  'Lakshadweep': 'south',
};

function stateToRegion(state: string): string {
  return REGION_MAP[state] ?? 'north';
}

// ── interest → category mapping ──────────────────────────────────────

const INTEREST_MAP: Record<string, string> = {
  'cultural & heritage sites': 'cultural-heritage',
  'cultural & heritage': 'cultural-heritage',
  'religious & spiritual pilgrimages': 'religious',
  'natural landscapes & wildlife': 'nature-wildlife',
  'adventure & outdoor activities': 'adventure',
  'adventure & outdoor': 'adventure',
  'arts, science & literature attractions': 'arts-science',
  'shopping & markets': 'shopping',
  'sightseeing & exploration': 'sightseeing',
  'culinary & food experiences': 'culinary',
  'sports & recreation': 'sports-recreation',
};

function interestToCategory(raw: string): string {
  const first = raw.split(',')[0].trim().toLowerCase();
  return INTEREST_MAP[first] ?? 'sightseeing';
}

function interestToTags(raw: string): string[] {
  return raw.split(',').map(s => {
    const key = s.trim().toLowerCase();
    return INTEREST_MAP[key] ?? key;
  });
}

// ── MAIN ─────────────────────────────────────────────────────────────

const dataDir = join(__dirname, '..', 'data');
const outFile = join(__dirname, '..', 'supabase', 'seed.sql');

// 1. Cities ────────────────────────────────────────────────────────
console.log('Loading indian-cities.csv...');
const citiesRaw = readFileSync(join(dataDir, 'indian-cities.csv'), 'utf-8');
const citiesCSV = parseCSV(citiesRaw);

const cityInserts: string[] = [];
const seenCities = new Set<string>();

for (const row of citiesCSV) {
  const name = row['City']?.trim();
  const state = normalizeState(row['State'] ?? '');
  const lat = parseFloat(row['Lat']);
  const lng = parseFloat(row['Long']);
  if (!name || !state || isNaN(lat) || isNaN(lng)) continue;
  const key = `${name.toLowerCase()}|${state.toLowerCase()}`;
  if (seenCities.has(key)) continue;
  seenCities.add(key);
  const region = stateToRegion(state);
  cityInserts.push(
    `  ('${esc(name)}', '${esc(state)}', '${region}', ${lat}, ${lng})`
  );
}
console.log(`  → ${cityInserts.length} cities`);

// 2. Destinations (base from tourism-atlas) ────────────────────────
console.log('Loading tourism-atlas.csv...');
const atlasRaw = readFileSync(join(dataDir, 'tourism-atlas.csv'), 'utf-8');
const atlasCSV = parseCSV(atlasRaw);

interface DestRow {
  name: string; city: string; state: string; region: string;
  category: string; lat: number; lng: number; rating: number;
  entrance_fee: number; tags: string[];
  // enrichment fields (from tourist-destinations.csv)
  type: string | null; visit_duration_hours: number | null;
  best_time_to_visit: string | null; weekly_off: string | null;
  significance: string | null; establishment_year: string | null;
  has_airport_nearby: boolean; dslr_allowed: boolean;
  review_count_lakhs: number | null;
}

const destMap = new Map<string, DestRow>();

for (const row of atlasCSV) {
  const name = (row['popular_destination'] ?? '').trim();
  const city = (row['city'] ?? '').trim();
  const state = normalizeState(row['state'] ?? '');
  if (!name || !city || !state) continue;

  const key = `${name.toLowerCase()}|${city.toLowerCase()}`;
  if (destMap.has(key)) continue;

  const rating = Math.min(5, Math.max(1, parseFloat(row['google_rating']) || 4.0));
  const fee = parseInt(row['price_fare']) || 0;
  const interest = row['interest'] ?? 'Sightseeing & Exploration';

  destMap.set(key, {
    name, city, state,
    region: stateToRegion(state),
    category: interestToCategory(interest),
    lat: parseFloat(row['latitude']) || 0,
    lng: parseFloat(row['longitude']) || 0,
    rating, entrance_fee: fee,
    tags: interestToTags(interest),
    type: null, visit_duration_hours: null,
    best_time_to_visit: null, weekly_off: null,
    significance: null, establishment_year: null,
    has_airport_nearby: false, dslr_allowed: true,
    review_count_lakhs: null,
  });
}
console.log(`  → ${destMap.size} base destinations from atlas`);

// 3. Enrich with tourist-destinations.csv ──────────────────────────
console.log('Loading tourist-destinations.csv...');
const touristRaw = readFileSync(join(dataDir, 'tourist-destinations.csv'), 'utf-8');
const touristCSV = parseCSV(touristRaw);

let enriched = 0;
let added = 0;

for (const row of touristCSV) {
  const name = (row['Name'] ?? '').trim();
  const city = (row['City'] ?? '').trim();
  const state = normalizeState(row['State'] ?? '');
  if (!name || !city || !state) continue;

  const key = `${name.toLowerCase()}|${city.toLowerCase()}`;
  const existing = destMap.get(key);

  if (existing) {
    // Enrich existing record
    existing.type = row['Type']?.trim() || null;
    const dur = parseFloat(row['time needed to visit in hrs']);
    existing.visit_duration_hours = isNaN(dur) ? null : dur;
    existing.best_time_to_visit = row['Best Time to visit']?.trim() || null;
    existing.weekly_off = row['Weekly Off']?.trim() || null;
    existing.significance = row['Significance']?.trim() || null;
    existing.establishment_year = row['Establishment Year']?.trim() || null;
    const airport = parseInt(row['Airport with 50km Radius']);
    existing.has_airport_nearby = !isNaN(airport) && airport > 0;
    existing.dslr_allowed = (row['DSLR Allowed']?.trim().toLowerCase() ?? 'yes') !== 'no';
    const reviews = parseFloat(row['Number of google review in lakhs']);
    existing.review_count_lakhs = isNaN(reviews) ? null : reviews;
    // Update rating if tourist-destinations has one
    const tRating = parseFloat(row['Google review rating']);
    if (!isNaN(tRating) && tRating >= 1 && tRating <= 5) existing.rating = tRating;
    enriched++;
  } else {
    // Add new destination not in atlas
    const rating = Math.min(5, Math.max(1, parseFloat(row['Google review rating']) || 4.0));
    const fee = parseInt(row['Entrance Fee in INR']) || 0;
    const dur = parseFloat(row['time needed to visit in hrs']);
    const reviews = parseFloat(row['Number of google review in lakhs']);
    const airport = parseInt(row['Airport with 50km Radius']);
    destMap.set(key, {
      name, city, state,
      region: stateToRegion(state),
      category: 'sightseeing', // default for tourist-destinations without interest column
      lat: 0, lng: 0, // will not have coordinates — flag for later
      rating, entrance_fee: fee,
      tags: ['sightseeing'],
      type: row['Type']?.trim() || null,
      visit_duration_hours: isNaN(dur) ? null : dur,
      best_time_to_visit: row['Best Time to visit']?.trim() || null,
      weekly_off: row['Weekly Off']?.trim() || null,
      significance: row['Significance']?.trim() || null,
      establishment_year: row['Establishment Year']?.trim() || null,
      has_airport_nearby: !isNaN(airport) && airport > 0,
      dslr_allowed: (row['DSLR Allowed']?.trim().toLowerCase() ?? 'yes') !== 'no',
      review_count_lakhs: isNaN(reviews) ? null : reviews,
    });
    added++;
  }
}
console.log(`  → ${enriched} enriched, ${added} new from tourist-destinations`);

// Build destination inserts ────────────────────────────────────────
const destInserts: string[] = [];
for (const d of destMap.values()) {
  // Skip destinations without coordinates (tourist-destinations-only entries without lat/lng)
  if (d.lat === 0 && d.lng === 0) continue;

  // Compute trending score = rating*20 + review_count_lakhs*10
  const trendingScore = Math.round(d.rating * 20 + (d.review_count_lakhs ?? 0) * 10);

  const tagsArr = `'{${d.tags.map(t => `"${esc(t)}"`).join(',')}}'`;
  const nullOrStr = (v: string | null) => v ? `'${esc(v)}'` : 'NULL';
  const nullOrNum = (v: number | null) => v !== null ? v : 'NULL';

  destInserts.push(
    `  ('${esc(d.name)}', '${esc(d.city)}', '${esc(d.state)}', '${d.region}', ` +
    `'${d.category}', ${nullOrStr(d.type)}, '', ` +
    `${d.lat}, ${d.lng}, ${d.rating}, ${d.entrance_fee}, ` +
    `${nullOrNum(d.visit_duration_hours)}, ${nullOrStr(d.best_time_to_visit)}, ` +
    `${nullOrStr(d.weekly_off)}, ${nullOrStr(d.significance)}, ` +
    `${nullOrStr(d.establishment_year)}, ${d.has_airport_nearby}, ${d.dslr_allowed}, ` +
    `${nullOrNum(d.review_count_lakhs)}, '/placeholder.svg', ` +
    `${tagsArr}, ${trendingScore})`
  );
}
console.log(`  → ${destInserts.length} total destinations with coordinates`);

// 4. Events (manually curated) ─────────────────────────────────────
const events = [
  { name: 'Diwali Festival of Lights', city: 'Jaipur', state: 'Rajasthan', date: '2026-10-20', end: '2026-10-25', cat: 'festival', desc: 'India\'s biggest festival of lights celebrated with fireworks, diyas, and sweets across Rajasthan.' },
  { name: 'Pushkar Camel Fair', city: 'Pushkar', state: 'Rajasthan', date: '2026-11-05', end: '2026-11-13', cat: 'cultural', desc: 'One of the world\'s largest camel fairs with livestock trading, cultural performances, and desert camping.' },
  { name: 'Hornbill Festival', city: 'Kohima', state: 'Nagaland', date: '2026-12-01', end: '2026-12-10', cat: 'festival', desc: 'Festival of Festivals showcasing Naga tribal culture, traditional dances, music, and indigenous games.' },
  { name: 'Holi Festival', city: 'Mathura', state: 'Uttar Pradesh', date: '2027-03-14', end: '2027-03-15', cat: 'festival', desc: 'The vibrant festival of colors celebrated with special fervor in Lord Krishna\'s birthplace.' },
  { name: 'Onam', city: 'Kochi', state: 'Kerala', date: '2026-09-10', end: '2026-09-20', cat: 'festival', desc: 'Kerala\'s harvest festival featuring elaborate boat races, floral carpets, and traditional Onam Sadhya feast.' },
  { name: 'Rann Utsav', city: 'Bhuj', state: 'Gujarat', date: '2026-11-01', end: '2027-02-28', cat: 'cultural', desc: 'A three-month cultural extravaganza on the white salt desert of Kutch with folk performances and crafts.' },
  { name: 'Durga Puja', city: 'Kolkata', state: 'West Bengal', date: '2026-10-01', end: '2026-10-05', cat: 'festival', desc: 'Kolkata\'s grandest festival with elaborate pandals, idol immersions, and cultural celebrations.' },
  { name: 'Ganesh Chaturthi', city: 'Mumbai', state: 'Maharashtra', date: '2026-09-17', end: '2026-09-27', cat: 'festival', desc: 'Mumbai\'s iconic 10-day celebration of Lord Ganesha with massive public installations and processions.' },
  { name: 'Pongal', city: 'Madurai', state: 'Tamil Nadu', date: '2027-01-14', end: '2027-01-17', cat: 'festival', desc: 'Tamil Nadu\'s four-day harvest festival with traditional kolam designs, cattle races, and sweet pongal cooking.' },
  { name: 'Cherry Blossom Festival', city: 'Shillong', state: 'Meghalaya', date: '2026-11-15', end: '2026-11-17', cat: 'nature', desc: 'India\'s only cherry blossom festival showcasing beautiful pink blooms across Shillong\'s hillsides.' },
  { name: 'Ziro Music Festival', city: 'Ziro', state: 'Arunachal Pradesh', date: '2026-09-25', end: '2026-09-28', cat: 'music', desc: 'An outdoor music festival in the stunning Ziro Valley featuring indie and world music acts.' },
  { name: 'Kumbh Mela', city: 'Allahabad', state: 'Uttar Pradesh', date: '2027-01-13', end: '2027-02-26', cat: 'festival', desc: 'The world\'s largest spiritual gathering at the confluence of the Ganga and Yamuna rivers.' },
  { name: 'International Kite Festival', city: 'Ahmedabad', state: 'Gujarat', date: '2027-01-14', end: '2027-01-14', cat: 'cultural', desc: 'A spectacular display of kites from around the world celebrating Uttarayan/Makar Sankranti.' },
  { name: 'Mysore Dasara', city: 'Mysore', state: 'Karnataka', date: '2026-10-12', end: '2026-10-21', cat: 'festival', desc: 'A 10-day royal celebration in Mysore Palace with illuminated processions and cultural events.' },
  { name: 'Hemis Festival', city: 'Leh', state: 'Ladakh', date: '2026-06-20', end: '2026-06-21', cat: 'cultural', desc: 'A vibrant Buddhist festival at Hemis Monastery featuring masked dances and traditional Ladakhi music.' },
];

const eventInserts = events.map(e =>
  `  ('${esc(e.name)}', '${esc(e.desc)}', '${esc(e.city)}', '${esc(e.state)}', '${e.date}', '${e.end}', '${e.cat}')`
);

// ── Write seed.sql ────────────────────────────────────────────────
const sql = `-- WanderGuide Seed Data
-- Generated by scripts/seed.ts
-- Run in Supabase SQL Editor or via CLI
--
-- Tables seeded: cities (${cityInserts.length}), destinations (${destInserts.length}), events (${eventInserts.length})

BEGIN;

-- ── 1. Cities ────────────────────────────────────────────────────────
INSERT INTO public.cities (name, state, region, latitude, longitude)
VALUES
${cityInserts.join(',\n')}
ON CONFLICT (name, state) DO NOTHING;

-- ── 2. Destinations ──────────────────────────────────────────────────
INSERT INTO public.destinations (
  name, city, state, region, category, type, description,
  latitude, longitude, rating, entrance_fee,
  visit_duration_hours, best_time_to_visit, weekly_off, significance,
  establishment_year, has_airport_nearby, dslr_allowed,
  review_count_lakhs, image_url, tags, trending_score
)
VALUES
${destInserts.join(',\n')};

-- ── 3. Events ────────────────────────────────────────────────────────
INSERT INTO public.events (name, description, city, state, event_date, end_date, category)
VALUES
${eventInserts.join(',\n')};

COMMIT;
`;

writeFileSync(outFile, sql, 'utf-8');
console.log(`\n✅ Seed file written to ${outFile}`);
console.log(`   Cities: ${cityInserts.length}`);
console.log(`   Destinations: ${destInserts.length}`);
console.log(`   Events: ${eventInserts.length}`);
