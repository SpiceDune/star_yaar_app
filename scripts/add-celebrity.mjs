/**
 * Add a celebrity to src/data/celebrities.ts
 *
 * Uses the cities table in Supabase for lat/lon/timezone lookup.
 *
 * Usage:
 *   node scripts/add-celebrity.mjs \
 *     --name "Virat Kohli" \
 *     --dob 1988-11-05 \
 *     --time 06:25 \
 *     --city "New Delhi" \
 *     --category cricket \
 *     --accuracy DD \
 *     --bio "One of the greatest batsmen in cricket history." \
 *     [--time-note "Approximate"]
 *
 * Interactive mode (no args):
 *   node scripts/add-celebrity.mjs
 *
 * Batch mode (JSON file):
 *   node scripts/add-celebrity.mjs --batch celebrities.json
 *
 *   JSON format: [{ "name": "...", "dob": "...", "time": "...", "city": "...",
 *                   "category": "...", "accuracy": "...", "bio": "...", "timeNote?": "..." }]
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const CELEBRITIES_FILE = join(__dirname, '..', 'src', 'data', 'celebrities.ts');
const VALID_CATEGORIES = ['bollywood', 'cricket', 'politics', 'business', 'music', 'sports', 'tv-digital', 'directors', 'historical'];
const VALID_ACCURACY = ['AA', 'A', 'B', 'C', 'DD'];

// ── Supabase client ──
function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    console.error('✗ Missing Supabase credentials in .env');
    process.exit(1);
  }
  return createClient(url, key);
}

// ── City lookup ──
async function lookupCity(supabase, cityQuery) {
  const name = cityQuery.split(',')[0].trim();
  const pattern = `%${name.replace(/%/g, '').replace(/_/g, ' ')}%`;

  const { data, error } = await supabase
    .from('cities')
    .select('id, name, state, country, latitude, longitude, timezone')
    .ilike('name', pattern)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('population', { ascending: false, nullsFirst: false })
    .limit(5);

  if (error) {
    console.error('✗ City search failed:', error.message);
    return null;
  }
  return data ?? [];
}

// ── Slug generation ──
function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-birth-chart';
}

// ── Read existing slugs ──
function getExistingSlugs() {
  const content = readFileSync(CELEBRITIES_FILE, 'utf-8');
  const matches = content.match(/slug:\s*'([^']+)'/g) ?? [];
  return new Set(matches.map(m => m.match(/'([^']+)'/)[1]));
}

// ── Append entry to celebrities.ts ──
function appendCelebrity(entry) {
  let content = readFileSync(CELEBRITIES_FILE, 'utf-8');

  const timeNoteLine = entry.timeNote
    ? `\n    timeNote: '${entry.timeNote.replace(/'/g, "\\'")}',`
    : '';

  const block = `  {
    slug: '${entry.slug}',
    name: '${entry.name.replace(/'/g, "\\'")}',
    dob: '${entry.dob}',
    time: '${entry.time}',
    city: '${entry.city.replace(/'/g, "\\'")}',
    lat: ${entry.lat}, lon: ${entry.lon},
    timezone: '${entry.timezone}',
    category: '${entry.category}',
    bio: '${entry.bio.replace(/'/g, "\\'")}',
    timeSource: '${entry.accuracy}',${timeNoteLine}
  },`;

  // Insert before the closing "];" of the celebrities array
  const insertPos = content.lastIndexOf('];');
  if (insertPos === -1) {
    console.error('✗ Could not find end of celebrities array in file');
    process.exit(1);
  }

  content = content.slice(0, insertPos) + block + '\n' + content.slice(insertPos);
  writeFileSync(CELEBRITIES_FILE, content, 'utf-8');
}

// ── Interactive readline helper ──
function createPrompt() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return {
    ask: (q) => new Promise(resolve => rl.question(q, resolve)),
    close: () => rl.close(),
  };
}

// ── Parse CLI args ──
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch' && args[i + 1]) { parsed.batch = args[++i]; continue; }
    if (args[i] === '--name' && args[i + 1]) { parsed.name = args[++i]; continue; }
    if (args[i] === '--dob' && args[i + 1]) { parsed.dob = args[++i]; continue; }
    if (args[i] === '--time' && args[i + 1]) { parsed.time = args[++i]; continue; }
    if (args[i] === '--city' && args[i + 1]) { parsed.city = args[++i]; continue; }
    if (args[i] === '--category' && args[i + 1]) { parsed.category = args[++i]; continue; }
    if (args[i] === '--accuracy' && args[i + 1]) { parsed.accuracy = args[++i].toUpperCase(); continue; }
    if (args[i] === '--bio' && args[i + 1]) { parsed.bio = args[++i]; continue; }
    if (args[i] === '--time-note' && args[i + 1]) { parsed.timeNote = args[++i]; continue; }
    if (args[i] === '--lat' && args[i + 1]) { parsed.lat = parseFloat(args[++i]); continue; }
    if (args[i] === '--lon' && args[i + 1]) { parsed.lon = parseFloat(args[++i]); continue; }
    if (args[i] === '--timezone' && args[i + 1]) { parsed.timezone = args[++i]; continue; }
  }
  return parsed;
}

// ── Validate entry fields ──
function validate(entry) {
  const errors = [];
  if (!entry.name) errors.push('name is required');
  if (!entry.dob || !/^\d{4}-\d{2}-\d{2}$/.test(entry.dob)) errors.push('dob must be YYYY-MM-DD');
  if (!entry.time || !/^\d{2}:\d{2}$/.test(entry.time)) errors.push('time must be HH:MM');
  if (!entry.city) errors.push('city is required');
  if (!VALID_CATEGORIES.includes(entry.category)) errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  if (!VALID_ACCURACY.includes(entry.accuracy)) errors.push(`accuracy must be one of: ${VALID_ACCURACY.join(', ')}`);
  if (!entry.bio) errors.push('bio is required');
  return errors;
}

// ── Process one celebrity ──
async function processOne(supabase, entry, existingSlugs, interactive = false) {
  const slug = nameToSlug(entry.name);

  if (existingSlugs.has(slug)) {
    console.log(`  ⏭  Skipping "${entry.name}" — slug "${slug}" already exists`);
    return false;
  }

  let lat = entry.lat;
  let lon = entry.lon;
  let timezone = entry.timezone;

  if (lat == null || lon == null || !timezone) {
    const cities = await lookupCity(supabase, entry.city);

    if (!cities || cities.length === 0) {
      console.error(`  ✗ No city found for "${entry.city}". Use --lat/--lon/--timezone to set manually.`);
      return false;
    }

    let chosen = cities[0];

    if (interactive && cities.length > 1) {
      console.log(`  Found ${cities.length} matches for "${entry.city}":`);
      cities.forEach((c, i) => {
        const label = [c.name, c.state, c.country].filter(Boolean).join(', ');
        console.log(`    ${i + 1}. ${label}  (${c.latitude}, ${c.longitude}, ${c.timezone})`);
      });
      const prompt = createPrompt();
      const pick = await prompt.ask('  Pick (1-' + cities.length + ', default 1): ');
      prompt.close();
      const idx = parseInt(pick, 10);
      if (idx >= 1 && idx <= cities.length) chosen = cities[idx - 1];
    }

    lat = lat ?? chosen.latitude;
    lon = lon ?? chosen.longitude;
    timezone = timezone || chosen.timezone || 'Asia/Kolkata';

    const label = [chosen.name, chosen.state, chosen.country].filter(Boolean).join(', ');
    entry.city = label;
  }

  const final = { ...entry, slug, lat, lon, timezone };
  appendCelebrity(final);
  existingSlugs.add(slug);
  console.log(`  ✓ Added "${entry.name}" → ${slug}`);
  return true;
}

// ── Main ──
async function main() {
  const args = parseArgs();
  const supabase = getSupabase();
  const existingSlugs = getExistingSlugs();

  console.log(`\n★ StarYaar Celebrity Tool — ${existingSlugs.size} existing entries\n`);

  // Batch mode
  if (args.batch) {
    const raw = readFileSync(args.batch, 'utf-8');
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries)) {
      console.error('✗ Batch file must contain a JSON array');
      process.exit(1);
    }
    console.log(`Processing ${entries.length} entries from ${args.batch}...\n`);
    let added = 0;
    for (const e of entries) {
      const errs = validate(e);
      if (errs.length) {
        console.log(`  ✗ Skipping "${e.name || '?'}": ${errs.join('; ')}`);
        continue;
      }
      const ok = await processOne(supabase, e, existingSlugs);
      if (ok) added++;
    }
    console.log(`\nDone. Added ${added}/${entries.length} celebrities. Total: ${existingSlugs.size}\n`);
    return;
  }

  // Single entry from CLI args
  if (args.name) {
    const errs = validate(args);
    if (errs.length) {
      console.error('✗ Validation errors:', errs.join('; '));
      process.exit(1);
    }
    await processOne(supabase, args, existingSlugs);
    console.log(`Total celebrities: ${existingSlugs.size}\n`);
    return;
  }

  // Interactive mode
  const prompt = createPrompt();
  console.log('Interactive mode — enter celebrity details (Ctrl+C to exit)\n');

  while (true) {
    const name = await prompt.ask('Name: ');
    if (!name.trim()) break;

    const dob = await prompt.ask('DOB (YYYY-MM-DD): ');
    const time = await prompt.ask('Birth time (HH:MM, 24h): ');
    const city = await prompt.ask('Birth city: ');

    console.log(`Categories: ${VALID_CATEGORIES.join(', ')}`);
    const category = await prompt.ask('Category: ');

    console.log(`Accuracy: ${VALID_ACCURACY.join(', ')}`);
    const accuracy = (await prompt.ask('Accuracy (default DD): ')).toUpperCase() || 'DD';

    const bio = await prompt.ask('Bio (1-2 sentences): ');
    const timeNote = await prompt.ask('Time note (optional, press Enter to skip): ');

    const entry = { name: name.trim(), dob, time, city, category, accuracy, bio, timeNote: timeNote || undefined };
    const errs = validate(entry);
    if (errs.length) {
      console.log(`  ✗ ${errs.join('; ')}\n`);
      continue;
    }

    // City lookup with interactive choice
    const cities = await lookupCity(supabase, city);
    if (!cities || cities.length === 0) {
      console.log(`  ✗ No city found for "${city}". Skipping.\n`);
      continue;
    }

    let chosen = cities[0];
    if (cities.length > 1) {
      console.log(`  Found ${cities.length} matches:`);
      cities.forEach((c, i) => {
        const label = [c.name, c.state, c.country].filter(Boolean).join(', ');
        console.log(`    ${i + 1}. ${label}  (${c.latitude}, ${c.longitude}, ${c.timezone})`);
      });
      const pick = await prompt.ask('  Pick (1-' + cities.length + ', default 1): ');
      const idx = parseInt(pick, 10);
      if (idx >= 1 && idx <= cities.length) chosen = cities[idx - 1];
    }

    const label = [chosen.name, chosen.state, chosen.country].filter(Boolean).join(', ');
    entry.city = label;
    entry.lat = chosen.latitude;
    entry.lon = chosen.longitude;
    entry.timezone = chosen.timezone || 'Asia/Kolkata';

    const slug = nameToSlug(name.trim());
    if (existingSlugs.has(slug)) {
      console.log(`  ⏭  "${name}" already exists (${slug})\n`);
      continue;
    }

    appendCelebrity({ ...entry, slug });
    existingSlugs.add(slug);
    console.log(`  ✓ Added "${name.trim()}" → ${slug}`);
    console.log(`  Total: ${existingSlugs.size}\n`);
  }

  prompt.close();
  console.log(`\nDone. Total celebrities: ${existingSlugs.size}\n`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
