export const categories = [
  { id: 'all', label: '全部图标', en: 'All icons', symbol: 'grid' },
  { id: 'flight', label: '飞行与操作', en: 'Flight', symbol: 'ship' },
  { id: 'targeting', label: '目标与战斗', en: 'Targeting', symbol: 'target' },
  { id: 'defense', label: '护盾与反制', en: 'Defense', symbol: 'shield' },
  { id: 'power', label: '能源与系统', en: 'Power', symbol: 'power' },
  { id: 'camera', label: '视角与相机', en: 'Camera', symbol: 'camera' },
  { id: 'vehicle', label: '地面载具与 EVA', en: 'Vehicle & EVA', symbol: 'vehicle' },
  { id: 'utility', label: '通用与界面', en: 'Utilities', symbol: 'tool' },
];

export function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLowerCase().replace(/scmdi|mdi(?=[a-z])/g, '').replace(/[\s_\-./]+/g, '');
}

function distance(a, b) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return edits;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return edits + Number(i < a.length || j < b.length);
}

export function searchScore(icon, query) {
  if (!query.trim()) return 1;
  const q = normalize(query);
  const sources = [icon.source, ...(icon.source.additionalSources ?? [])];
  const names = [icon.exportName, icon.name, ...icon.exportAliases, ...icon.naming.candidates, ...sources.flatMap(source => [source.mdiName, source.mdiExport])].filter(Boolean).map(normalize);
  if (names.includes(q)) return 100;
  if (names.some(name => name.startsWith(q))) return 80;
  const fields = [...names, icon.label.en, icon.label.zh, icon.description.en, icon.description.zh, ...icon.tags, ...icon.actions].map(normalize);
  if (fields.some(field => field.includes(q))) return 60;
  const terms = query.toLowerCase().trim().split(/\s+/).map(normalize).filter(Boolean);
  if (terms.every(term => fields.some(field => field.includes(term)))) return 40;
  if (/^[a-z]{4,}$/.test(q)) {
    const words = [icon.exportName.replace(/([a-z])([A-Z])/g, '$1 $2'), icon.label.en, ...icon.tags].join(' ').toLowerCase().split(/[^a-z]+/).filter(Boolean);
    if (words.some(word => distance(word, q) <= 1)) return 20;
  }
  return 0;
}

export function sourceGroups(icon) {
  const groups = new Set();
  for (const source of [icon.source, ...(icon.source.additionalSources ?? [])]) {
    if (source.kind === 'original') groups.add('original');
    else if (source.kind === 'mdi-alias' || source.kind === 'mdi-derived') groups.add(source.kind);
    else if (source.kind === 'game-derived') groups.add('game');
  }
  return [...groups];
}

export function filterIcons(icons, { query = '', category = 'all', source = 'all', origin = 'all', status = 'all' } = {}) {
  return icons.filter(icon => (category === 'all' || icon.category === category) && (source === 'all' || icon.source.kind === source) && (origin === 'all' || sourceGroups(icon).includes(origin)) && (status === 'all' || icon.naming.status === status))
    .map(icon => ({ icon, score: searchScore(icon, query) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.icon.exportName.localeCompare(b.icon.exportName, 'en', { sensitivity: 'base' })).map(item => item.icon);
}

export function validateNamingEdit(edit) {
  if (!edit || typeof edit.exportName !== 'string' || !/^scmdi[A-Z][A-Za-z0-9]*$/.test(edit.exportName)) throw new Error('名称需以 scmdi 开头，后接大写字母，只能包含英文字母和数字。');
  if (!['draft', 'confirmed'].includes(edit.status)) throw new Error('无效的命名状态。');
  if (!Array.isArray(edit.candidates) || edit.candidates.some(name => typeof name !== 'string' || !/^scmdi[A-Z][A-Za-z0-9]*$/.test(name))) throw new Error('候选名称也需使用 scmdiCamelCase 格式。');
  if (typeof edit.notes !== 'string' || edit.notes.length > 10000) throw new Error('备注无效或过长。');
}

export function overlayEdits(icons, edits) {
  return icons.map(icon => {
    const edit = edits[icon.id];
    if (!edit) return icon;
    return { ...icon, exportName: edit.exportName, naming: { ...icon.naming, status: edit.status, candidates: edit.candidates, notes: edit.notes } };
  });
}

export function reconcileReviewEdits(icons, edits, appliedIds = []) {
  const applied = new Set(appliedIds);
  const byId = new Map(icons.map(icon => [icon.id, icon]));
  return Object.fromEntries(Object.entries(edits).filter(([id, edit]) => {
    const icon = byId.get(id);
    if (!icon) return false;
    return edit.exportName !== icon.exportName
      || JSON.stringify(edit.candidates) !== JSON.stringify(icon.naming.candidates)
      || edit.notes !== icon.naming.notes
      || (!applied.has(id) && edit.status !== icon.naming.status);
  }));
}

export function assertUniqueNames(icons) {
  const names = new Set();
  for (const icon of icons) for (const name of [icon.exportName, ...icon.exportAliases]) {
    if (names.has(name)) throw new Error(`导出名称重复：${name}`);
    names.add(name);
  }
}

export function applyReviewPatch(catalog, patch) {
  if (!patch || patch.schemaVersion !== 1 || patch.baseRevision !== catalog.revision || !Array.isArray(patch.changes)) throw new Error('审阅文件与当前图标源版本不匹配。请重新导出。');
  const edits = {};
  const seen = new Set();
  for (const change of patch.changes) {
    const icon = catalog.icons.find(item => item.id === change.id);
    if (!icon || seen.has(change.id) || icon.exportName !== change.baseExportName) throw new Error(`图标不存在、重复或已被修改：${change.id}`);
    validateNamingEdit(change);
    seen.add(change.id);
    edits[change.id] = change;
  }
  const icons = overlayEdits(catalog.icons, edits);
  assertUniqueNames(icons);
  return { ...catalog, icons, revision: patch.changes.length ? `${catalog.revision.split('+review-')[0]}+review-${Date.now()}` : catalog.revision };
}

export function svgMarkup(path) {
  const safePath = String(path).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="${safePath}"/></svg>`;
}
