import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateCatalog } from './validation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(fs.readFileSync(`${root}/icons/catalog.json`, 'utf8'));
const errors = validateCatalog(catalog, { release: process.argv.includes('--release') });
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${catalog.icons.length} entries (${new Set(catalog.icons.map(icon => icon.path)).size} distinct paths).`);
}
