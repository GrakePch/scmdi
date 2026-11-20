import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { applyReviewPatch } from '../apps/catalog/src/library.mjs';
import { validateCatalog } from './validation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const input = process.argv[2];
if (!input) throw new Error('Usage: npm run review:apply -- <exported-review.json> [--write]');
const filename = `${root}/icons/catalog.json`;
const catalog = JSON.parse(await fs.readFile(filename, 'utf8'));
const patch = JSON.parse(await fs.readFile(input, 'utf8'));
const result = applyReviewPatch(catalog, patch);
const errors = validateCatalog(result);
if (errors.length) throw new Error(errors.join('\n'));
if (process.argv.includes('--write')) {
  await fs.writeFile(filename, JSON.stringify(result, null, 2) + '\n');
  console.log(`Applied ${patch.changes.length} naming changes. Rebuild the package and catalog.`);
} else {
  console.log(`Validated ${patch.changes.length} naming changes. Add --write to update icons/catalog.json.`);
}
