import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve } from 'path';

try {
  // Read .env.local
  const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);

  if (!match) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const url = match[1];
  console.log('Connecting to Neon Serverless Postgres...');
  const sql = postgres(url, { ssl: 'require', max: 1 });

  // 1. Run live proof query
  const info = await sql`SELECT version(), current_database() as db, current_user as user, now() as server_time`;
  console.log('Connection successful!');
  console.log('Server Time:', info[0].server_time);
  console.log('Database:', info[0].db);
  console.log('User:', info[0].user);
  console.log('PostgreSQL Version:', info[0].version.split(' ')[0], info[0].version.split(' ')[1]);

  // 2. Create tables matching schema
  console.log('\nCreating/verifying schema tables in Neon...');

  await sql`
    CREATE TABLE IF NOT EXISTS awlr_stations (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      river_name VARCHAR(100) NOT NULL,
      water_level_cm INTEGER NOT NULL,
      alert_level_cm INTEGER NOT NULL,
      status VARCHAR(20) NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS citizen_reports (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      author_name VARCHAR(60) DEFAULT 'Warga Anonim' NOT NULL,
      caption VARCHAR(280) NOT NULL,
      water_depth_category VARCHAR(30) NOT NULL,
      depth_cm_estimate INTEGER,
      image_url TEXT,
      tiktok_live_url TEXT,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      district VARCHAR(60) NOT NULL,
      upvotes_count INTEGER DEFAULT 0 NOT NULL,
      downvotes_count INTEGER DEFAULT 0 NOT NULL,
      is_ai_verified BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  // 3. Verify created tables
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  console.log('\nActive Tables in Neon Database:');
  tables.forEach((t) => console.log('✓ public.' + t.table_name));

  await sql.end();
  console.log('\nNeon Database is fully initialized and ready for production!');
} catch (err) {
  console.error('Error connecting to Neon:', err);
  process.exit(1);
}

