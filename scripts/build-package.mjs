import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateCatalog } from './validation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(await fs.readFile(`${root}/icons/catalog.json`, 'utf8'));
const errors = validateCatalog(catalog);
if (errors.length) throw new Error(errors.join('\n'));
const dir = `${root}/packages/js`;
await fs.mkdir(`${dir}/dist`, { recursive: true });
const header = `/* SCMDI icon paths — Apache License 2.0.\n * Includes original artwork, MDI references and adapted artwork.\n * See individual export comments and THIRD_PARTY_NOTICES.md for attribution and modification notices.\n * The full license is in LICENSE.\n */\n`;
const esm = [header];
const cjs = [header, '"use strict";'];
const types = ['/** SCMDI SVG icon paths. See LICENSE and THIRD_PARTY_NOTICES.md for licensing and source attribution. */'];

function mdiModificationNotice(source) {
  return [
    source.changes ?? `Modified from MDI ${source.mdiName ?? '(upstream icon not specified)'} for SCMDI.`,
    source.author && `Upstream artwork: ${source.author}.`,
    source.referenceVersion && `Reference package: @mdi/js ${source.referenceVersion}.`,
    source.license && `License: ${source.license}.`,
    source.url && `Source: ${source.url}`,
  ].filter(Boolean).join(' ');
}

const paths = new Map();
for (const icon of catalog.icons) {
  const canonical = paths.get(icon.path);
  const comment = icon.source.kind === 'mdi-alias'
    ? `// Unmodified MDI ${icon.source.mdiName} (${icon.source.version}); SC semantic alias. ${icon.source.author ?? 'Pictogrammers contributors'}.${icon.source.url ? ` Source: ${icon.source.url}` : ''}`
    : icon.source.kind === 'mdi-derived'
      ? `// ${mdiModificationNotice(icon.source)}`
      : icon.source.kind === 'game-derived'
        ? `// ${icon.id}: ${icon.source.changes} Reference: ${icon.source.reference}. License: ${icon.source.license ?? 'not specified'}.`
      : icon.source.kind === 'original'
        ? `// ${icon.id}: original artwork.${icon.source.author ? ` ${icon.source.author}.` : ''} License: ${icon.source.license ?? 'not specified'}.`
        : `// ${icon.id}: see the catalog for source and license information.`;
  const additionalComments = (icon.source.additionalSources ?? []).map(source => `// Additional source: ${mdiModificationNotice(source)}`);
  esm.push(comment, ...additionalComments, `export const ${icon.exportName} = ${canonical ?? JSON.stringify(icon.path)};`);
  cjs.push(comment, ...additionalComments, `exports.${icon.exportName} = ${canonical ? `exports.${canonical}` : JSON.stringify(icon.path)};`);
  types.push(`export declare const ${icon.exportName}: string;`);
  paths.set(icon.path, canonical ?? icon.exportName);
  for (const alias of icon.exportAliases ?? []) {
    esm.push(`/** @deprecated Use ${icon.exportName}. */`, `export const ${alias} = ${icon.exportName};`);
    cjs.push(`exports.${alias} = exports.${icon.exportName};`);
    types.push(`/** @deprecated Use ${icon.exportName}. */`, `export declare const ${alias}: string;`);
  }
}
await Promise.all([
  fs.writeFile(`${dir}/dist/index.js`, esm.join('\n') + '\n'),
  fs.writeFile(`${dir}/dist/index.cjs`, cjs.join('\n') + '\n'),
  fs.writeFile(`${dir}/dist/index.d.ts`, types.join('\n') + '\n'),
  ...['LICENSE', 'THIRD_PARTY_NOTICES.md'].map(name => fs.copyFile(`${root}/${name}`, `${dir}/${name}`)),
]);
console.log(`Built ${catalog.icons.length} exports from ${paths.size} distinct paths; no runtime dependencies.`);
