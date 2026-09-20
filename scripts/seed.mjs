/**
 * Database Seed Script for Supabase
 * Usage: node scripts/seed.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local if present
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim();
      if (key === 'NEXT_PUBLIC_SUPABASE_URL' && !supabaseUrl) supabaseUrl = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY' && !serviceKey) serviceKey = val;
      if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !serviceKey) serviceKey = val;
    }
  }
} catch (e) {
  // Ignore
}

console.log('--- ApexCare Seed Runner ---');
if (!supabaseUrl || !serviceKey || supabaseUrl.includes('placeholder')) {
  console.log('\n[NOTICE] No remote Supabase instance configured in .env.local.');
  console.log('The prototype is running in Standalone Sandbox Demo Mode with rich client data.');
  console.log('\nTo seed a real Supabase database:');
  console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Navigate to SQL Editor and run `supabase/schema.sql`.');
  console.log('3. Next, run `supabase/seed.sql` in the SQL Editor.');
  console.log('4. Copy your Project URL & Anon Key into `.env.local`.\n');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runSeed() {
  console.log(`Connecting to ${supabaseUrl}...`);
  const sqlPath = path.resolve(process.cwd(), 'supabase', 'seed.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('supabase/seed.sql not found.');
    process.exit(1);
  }

  console.log('Seeding demo data via SQL is best executed via the Supabase SQL Editor.');
  console.log(`Open: ${supabaseUrl.replace('.supabase.co', '')}/project/_/sql`);
  console.log('Or copy contents of supabase/seed.sql into the SQL Editor.');
}

runSeed();
