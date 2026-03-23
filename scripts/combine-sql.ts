/**
 * Combine all migrations + seed into a single SQL file
 * for pasting into the Supabase SQL Editor.
 * Usage: pnpm dlx tsx scripts/combine-sql.ts
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
const seedFile = join(__dirname, '..', 'supabase', 'seed.sql');
const outFile = join(__dirname, '..', 'supabase', 'combined.sql');

let combined = '-- WanderGuide: Combined Migrations + Seed\n-- Paste this entire file into Supabase SQL Editor and click Run\n\n';

// Migrations
const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
for (const file of files) {
  combined += `-- ════════════════════════════════════════════════════════════\n`;
  combined += `-- Migration: ${file}\n`;
  combined += `-- ════════════════════════════════════════════════════════════\n\n`;
  combined += readFileSync(join(migrationsDir, file), 'utf-8');
  combined += '\n\n';
}

// Seed
combined += `-- ════════════════════════════════════════════════════════════\n`;
combined += `-- Seed Data\n`;
combined += `-- ════════════════════════════════════════════════════════════\n\n`;
combined += readFileSync(seedFile, 'utf-8');

writeFileSync(outFile, combined, 'utf-8');
const sizeKB = Math.round(combined.length / 1024);
console.log(`✅ Combined SQL written to supabase/combined.sql (${sizeKB} KB)`);
console.log(`   Open Supabase Dashboard → SQL Editor → paste the file contents → Run`);
