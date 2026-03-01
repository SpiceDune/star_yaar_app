/**
 * Generate 192x192 and 512x512 PNG icons from public/favicon.svg for PWA installability.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const svgPath = join(root, 'public', 'favicon.svg');
const outDir = join(root, 'public', 'icons');

const svg = readFileSync(svgPath);

async function generate() {
  for (const size of [192, 512]) {
    const buf = await sharp(svg)
      .resize(size, size)
      .png()
      .toBuffer();
    const outPath = join(outDir, `icon-${size}.png`);
    writeFileSync(outPath, buf);
    console.log(`Wrote ${outPath}`);
  }
  console.log('Done. PWA icons (192, 512) generated.');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
