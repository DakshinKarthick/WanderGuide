import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const combined = readFileSync(join(ROOT, 'supabase', 'combined.sql'), 'utf-8');
const lines = combined.split('\n');

// Structure discovered:
// Lines 1-210:   DDL (migrations)
// Lines 211-439: Seed cities (BEGIN + INSERT + ON CONFLICT)
// Lines 440-1465: Seed destinations (INSERT + big VALUES block)
// Lines 1466-1486: Seed events (INSERT + COMMIT)

// Part 1: DDL only (lines 1-210)
const part1 = lines.slice(0, 210).join('\n');
writeFileSync(join(ROOT, 'supabase', 'part1-migrations.sql'), part1);
console.log(`✅ part1-migrations.sql (${(part1.length / 1024).toFixed(0)} KB)`);

// Part 2: Cities seed (lines 211-439, wrapped in BEGIN/COMMIT)
const citiesLines = lines.slice(210, 439);
const part2 = `-- WanderGuide: Part 2 - Cities Seed Data\nBEGIN;\n\n${citiesLines.join('\n')}\n\nCOMMIT;\n`;
writeFileSync(join(ROOT, 'supabase', 'part2-seed-cities.sql'), part2);
console.log(`✅ part2-seed-cities.sql (${(part2.length / 1024).toFixed(0)} KB)`);

// Part 3a & 3b: Split destinations
// INSERT header is lines 441-449 (0-indexed: 440-448), data rows start at line 450 (index 449)
const destHeader = lines.slice(440, 449).join('\n'); // INSERT INTO ... VALUES
const destMidpoint = 950; // split data rows at index 950

// First half data rows: index 449 to 949 (file lines 450-950)
const destValuesFirstHalf = lines.slice(449, destMidpoint);
let lastLineA = destValuesFirstHalf[destValuesFirstHalf.length - 1];
if (lastLineA.trimEnd().endsWith(',')) {
  destValuesFirstHalf[destValuesFirstHalf.length - 1] = lastLineA.replace(/,\s*$/, ';');
}
const part3a = `-- WanderGuide: Part 3a - Destinations Seed (first half)\nBEGIN;\n\n${destHeader}\n${destValuesFirstHalf.join('\n')}\n\nCOMMIT;\n`;
writeFileSync(join(ROOT, 'supabase', 'part3a-seed-destinations.sql'), part3a);
console.log(`✅ part3a-seed-destinations.sql (${(part3a.length / 1024).toFixed(0)} KB)`);

// Second half data rows: index 950 to 1464 (file lines 951-1465)
const destValuesSecondHalf = lines.slice(destMidpoint, 1465);
let lastLineB = destValuesSecondHalf[destValuesSecondHalf.length - 1];
if (lastLineB.trimEnd().endsWith(',')) {
  destValuesSecondHalf[destValuesSecondHalf.length - 1] = lastLineB.replace(/,\s*$/, ';');
}
const part3b = `-- WanderGuide: Part 3b - Destinations Seed (second half)\nBEGIN;\n\n${destHeader}\n${destValuesSecondHalf.join('\n')}\n\nCOMMIT;\n`;
writeFileSync(join(ROOT, 'supabase', 'part3b-seed-destinations.sql'), part3b);
console.log(`✅ part3b-seed-destinations.sql (${(part3b.length / 1024).toFixed(0)} KB)`);

// Part 4: Events seed (lines 1466-1486)
const eventsLines = lines.slice(1465);
const part4 = `-- WanderGuide: Part 4 - Events Seed Data\nBEGIN;\n\n${eventsLines.join('\n')}\n`;
writeFileSync(join(ROOT, 'supabase', 'part4-seed-events.sql'), part4);
console.log(`✅ part4-seed-events.sql (${(part4.length / 1024).toFixed(0)} KB)`);

console.log('\n📋 Paste into Supabase SQL Editor in order:');
console.log('   1. part1-migrations.sql');
console.log('   2. part2-seed-cities.sql');
console.log('   3. part3a-seed-destinations.sql');
console.log('   4. part3b-seed-destinations.sql');
console.log('   5. part4-seed-events.sql');
