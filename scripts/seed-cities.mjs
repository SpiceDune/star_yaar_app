/**
 * Create cities table (if not exists) and seed from SimpleMaps worldcities.csv.
 * CSV columns: city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, id
 *
 * Usage:
 *   node scripts/seed-cities.mjs <path-to-worldcities.csv>
 * Example:
 *   node scripts/seed-cities.mjs ~/Downloads/simplemaps_worldcities_basicv1.901/worldcities.csv
 *
 * Requires DATABASE_URL in .env (Supabase connection string).
 */
import dotenv from 'dotenv';
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
dotenv.config({ path: join(root, '.env') });
dotenv.config({ path: join(root, '.env.local') });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const csvPath = process.argv[2];
if (!csvPath || !existsSync(csvPath)) {
  console.error('Usage: node scripts/seed-cities.mjs <path-to-worldcities.csv>');
  console.error('Example: node scripts/seed-cities.mjs ~/Downloads/simplemaps_worldcities_basicv1.901/worldcities.csv');
  process.exit(1);
}

/** Parse a single CSV line with double-quoted fields (handles "" as escaped quote). */
function parseCsvLine(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let field = '';
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          field += line[i];
          i++;
        }
      }
      out.push(field);
    } else if (line[i] === ',') {
      i++;
    } else {
      let field = '';
      while (i < line.length && line[i] !== ',') {
        field += line[i];
        i++;
      }
      out.push(field.trim());
      if (line[i] === ',') i++;
    }
  }
  return out;
}

const migrationSql = `
DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  country_code CHAR(2),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  population INTEGER,
  search_text TEXT
);

CREATE INDEX idx_cities_name_lower ON cities (LOWER(name));
CREATE INDEX idx_cities_search_text ON cities USING gin (to_tsvector('simple', COALESCE(search_text, '')));
CREATE INDEX idx_cities_population ON cities (population DESC NULLS LAST);
`;

const BATCH_SIZE = 1000;

async function main() {
  console.log('Reading CSV:', csvPath);
  const raw = readFileSync(csvPath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  const header = parseCsvLine(lines[0]);
  if (header[0] !== 'city' || !header.includes('id')) {
    console.error('Expected CSV columns: city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, id');
    process.exit(1);
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length < 11) continue;
    const [city, city_ascii, lat, lng, country, iso2, iso3, admin_name, _capital, population, idStr] = cells;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) continue;
    const pop = population ? parseInt(population, 10) : null;
    const latNum = lat ? parseFloat(lat) : null;
    const lngNum = lng ? parseFloat(lng) : null;
    const name = (city_ascii || city || '').trim() || 'Unknown';
    const search_text = [city_ascii || city, admin_name, country].filter(Boolean).join(' ').toLowerCase();
    rows.push({
      id,
      name,
      state: (admin_name || '').trim() || null,
      country: (country || '').trim() || 'Unknown',
      country_code: (iso2 || '').trim() || null,
      latitude: Number.isFinite(latNum) ? latNum : null,
      longitude: Number.isFinite(lngNum) ? lngNum : null,
      timezone: null,
      population: Number.isInteger(pop) ? pop : null,
      search_text: search_text || null,
    });
  }

  console.log('Parsed', rows.length, 'cities. Connecting to DB...');

  const client = new pg.Client({
    connectionString: url,
    ssl: url.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();

    console.log('Running migration (drop + create cities table)...');
    await client.query(migrationSql);

    console.log('Inserting rows in batches of', BATCH_SIZE, '...');
    const cols = ['id', 'name', 'state', 'country', 'country_code', 'latitude', 'longitude', 'timezone', 'population', 'search_text'];
    let inserted = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const placeholders = batch
        .map((_, b) => `(${cols.map((_, c) => `$${b * cols.length + c + 1}`).join(',')})`)
        .join(',');
      const values = batch.flatMap((r) => [
        r.id,
        r.name,
        r.state,
        r.country,
        r.country_code,
        r.latitude,
        r.longitude,
        null,
        r.population,
        r.search_text,
      ]);
      await client.query(
        `INSERT INTO cities (${cols.join(',')}) VALUES ${placeholders} ON CONFLICT (id) DO NOTHING`,
        values
      );
      inserted += batch.length;
      if (inserted % 5000 === 0 || inserted === rows.length) console.log('  ', inserted, '/', rows.length);
    }

    console.log('Done. Total rows in cities:', inserted);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
