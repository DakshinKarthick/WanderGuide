/**
 * Run all migrations + seed against Supabase PostgreSQL
 * Usage: npx tsx scripts/run-migrations.ts
 */
import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = `postgresql://postgres.lexyittpnivqgffiyivk:E6x%21JPgZz64beX3@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

async function run() {
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
