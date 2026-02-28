/**
 * Seed panchang table with daily data from 1970-01-01 to 2040-12-31.
 * Uses @fusionstrings/panchangam (Swiss Ephemeris) with Delhi as reference location.
 *
 * Usage:
 *   Create .env with PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for bypass RLS).
 *   Run: node scripts/seed-panchang.mjs
 *
 * Optional: SUPABASE_SERVICE_ROLE_KEY for insert (if RLS blocks anon).
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });
import { calculate_daily_panchang, Location } from '@fusionstrings/panchangam';

const BATCH_SIZE = 100;
const START_YEAR = 1970;
const END_YEAR = 2040;
const DELHI = new Location(28.6139, 77.2090, 225.0);
const AYANAMSHA_LAHIRI = 1;

const VARAS_ENGLISH = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const RASHI_FROM_DEGREES = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];
const RASHI_ENGLISH = {
  Mesha: 'Aries', Vrishabha: 'Taurus', Mithuna: 'Gemini', Karka: 'Cancer',
  Simha: 'Leo', Kanya: 'Virgo', Tula: 'Libra', Vrishchika: 'Scorpio',
  Dhanu: 'Sagittarius', Makara: 'Capricorn', Kumbha: 'Aquarius', Meena: 'Pisces',
};

function lagnaFromDegrees(deg) {
  const index = Math.floor(((deg % 360) + 360) % 360 / 30) % 12;
  return RASHI_FROM_DEGREES[index];
}

function dateToYMD(d) {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return [y, m, day];
}

function formatDate(y, m, day) {
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function main() {
  const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Missing PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env');
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const rows = [];
  const start = new Date(Date.UTC(START_YEAR, 0, 1));
  const end = new Date(Date.UTC(END_YEAR, 11, 31));

  console.log('Generating panchang from 1970-01-01 to 2040-12-31 (reference: Delhi)...');
  let count = 0;
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const [y, m, day] = dateToYMD(d);
    const dateStr = formatDate(y, m, day);
    try {
      const result = calculate_daily_panchang(y, m, day, DELHI, AYANAMSHA_LAHIRI);
      const weekday = d.getUTCDay();
      const lagnaDeg = result.ascendant ?? 0;
      rows.push({
        date: dateStr,
        tithi: result.tithi_name || '',
        nakshatra: result.nakshatra_name || '',
        nakshatra_pada: result.nakshatra_pada ?? null,
        yoga: result.yoga_name || null,
        karana: result.karana_name || null,
        vara: result.vara_name || '',
        vara_english: VARAS_ENGLISH[weekday] || null,
        lagna: lagnaFromDegrees(lagnaDeg),
        lagna_english: RASHI_ENGLISH[lagnaFromDegrees(lagnaDeg)] ?? null,
      });
      count++;
      if (count % 5000 === 0) console.log(`  ... ${count} days`);
    } catch (err) {
      console.warn(`Skip ${dateStr}:`, err.message);
    }
  }

  console.log(`Total rows to insert: ${rows.length}`);
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('panchang').upsert(batch, {
      onConflict: 'date',
      ignoreDuplicates: false,
    });
    if (error) {
      console.error('Insert error:', error);
      process.exit(1);
    }
    if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) console.log(`  Inserted ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`);
  }
  console.log('Done.');
}

main();
