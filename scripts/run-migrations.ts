/**
 * Run all migrations + seed against Supabase PostgreSQL
 * Usage: npx tsx scripts/run-migrations.ts
 */
import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

function readDotEnvVar(key: string): string | undefined {
  try {
    const envPath = join(__dirname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const k = line.slice(0, idx).trim();
      if (k !== key) continue;
      return line.slice(idx + 1).trim();
    }
  } catch {
    // Ignore missing .env; process.env may still provide values.
  }
  return undefined;
}

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  readDotEnvVar('DATABASE_URL') ||
  readDotEnvVar('SUPABASE_DB_URL');

async function run() {
  if (!DATABASE_URL) {
    console.error('❌ Missing DATABASE_URL (or SUPABASE_DB_URL).');
    console.error('   Add it to .env and rerun: npx tsx scripts/run-migrations.ts');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected!\n');

    // Run migrations in order
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      try {
        await client.query(sql);
        console.log(`  ✅ ${file} — success`);
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          console.log(`  ⏭️  ${file} — already exists, skipping`);
        } else {
          console.error(`  ❌ ${file} — ERROR: ${err.message}`);
          throw err;
        }
      }
    }

    // Run seed
    console.log('\nRunning seed.sql...');
    const seedPath = join(__dirname, '..', 'supabase', 'seed.sql');
    const seedSql = readFileSync(seedPath, 'utf-8');
    try {
      await client.query(seedSql);
      console.log('  ✅ seed.sql — success');
    } catch (err: any) {
      console.error(`  ❌ seed.sql — ERROR: ${err.message}`);
      throw err;
    }

    // Verify counts
    console.log('\nVerifying data...');
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM public.cities'),
      client.query('SELECT COUNT(*) FROM public.destinations'),
      client.query('SELECT COUNT(*) FROM public.events'),
    ]);
    console.log(`  Cities:       ${counts[0].rows[0].count}`);
    console.log(`  Destinations: ${counts[1].rows[0].count}`);
    console.log(`  Events:       ${counts[2].rows[0].count}`);
    console.log('\n✅ All migrations and seed data applied successfully!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
