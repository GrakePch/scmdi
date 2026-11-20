import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(await fs.readFile(`${root}/icons/catalog.json`, 'utf8'));
await fs.mkdir(`${root}/apps/catalog/public`, { recursive: true });
await fs.writeFile(`${root}/apps/catalog/public/favicon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="7" fill="#6750a4"/><path fill="#ffffff" d="${catalog.icons.find(icon => icon.exportName === 'scmdiShip')?.path ?? catalog.icons[0].path}"/></svg>`);
const notices = [await fs.readFile(`${root}/THIRD_PARTY_NOTICES.md`, 'utf8'), '\n\nSCMDI LICENSE\n', await fs.readFile(`${root}/LICENSE`, 'utf8')];
notices.push('\n\nNoto Sans SC catalog font subsets\n==================================================\n', await fs.readFile(`${root}/apps/catalog/src/font-assets/OFL-Noto-Sans-SC.txt`, 'utf8'));
for (const dependency of ['react', 'react-dom', 'scheduler', '@mdi/react', '@mdi/js', 'prop-types', 'react-is', 'object-assign', '@material/web', '@lit/react', 'lit', 'lit-html', 'lit-element', '@lit/reactive-element', '@lit/context', 'tslib', '@fontsource-variable/google-sans', '@fontsource-variable/noto-sans-sc', '@fontsource-variable/fira-code']) {
  let license;
  for (const filename of ['LICENSE', 'license', 'LICENSE.txt']) {
    license = await fs.readFile(`${root}/node_modules/${dependency}/${filename}`, 'utf8').catch(() => undefined);
    if (license) break;
  }
  if (!license) throw new Error(`Missing license for ${dependency}`);
  notices.push(`\n\n${dependency}\n${'='.repeat(50)}\n`, license);
}
await fs.writeFile(`${root}/apps/catalog/public/THIRD_PARTY_NOTICES.txt`, notices.join('\n'));
