/**
 * Test cities search – run: node scripts/test-cities.mjs
 * Loads .env and calls Supabase to search cities for "agra", logs full response and errors.
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const url = process.env.PUBLIC_SUPABASE_URL;
const key = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log('Testing cities search for "agra"...\n');

  const pattern = '%agra%';

  const { data, error } = await supabase
    .from('cities')
    .select('id, name, state, country')
    .ilike('name', pattern)
    .limit(20);

  console.log('Error:', error ? { message: error.message, code: error.code, details: error.details } : null);
  console.log('Data count:', data?.length ?? 0);
  console.log('Data sample:', data?.slice(0, 3) ?? []);

  if (!error && (!data || data.length === 0)) {
    console.log('\nNo rows – trying raw select (no filter) to see if table is readable...');
    const { data: raw, error: rawError } = await supabase.from('cities').select('id, name, state, country').limit(3);
    console.log('Raw select error:', rawError ? { message: rawError.message, code: rawError.code } : null);
    console.log('Raw rows:', raw ?? []);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
