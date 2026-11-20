import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyReviewPatch, filterIcons, overlayEdits, reconcileReviewEdits, sourceGroups, svgMarkup } from '../apps/catalog/src/library.mjs';
import { validateCatalog } from '../scripts/validation.mjs';

const catalog = JSON.parse(fs.readFileSync(new URL('../icons/catalog.json', import.meta.url), 'utf8'));
const brake = catalog.icons.find(icon => icon.id === 'icon-0027');
const originalBrakeName = brake.exportName;
const patch = change => ({ schemaVersion: 1, baseRevision: catalog.revision, changes: [{ id: brake.id, baseExportName: brake.exportName, exportName: 'scmdiSpaceBrakeNew', status: 'confirmed', candidates: ['scmdiSpaceStop'], notes: 'Review note', ...change }] });

test('search resolves SC semantics, Chinese labels, upstream MDI names, and action IDs', () => {
  for (const query of [brake.exportName, 'scmdiSpaceBrake', 'space brake', '太空刹车', '太空制动', brake.label.zh, 'mdiCarBrakeAlert', 'spaceship_movement.v_space_brake']) {
    assert.ok(filterIcons(catalog.icons, { query }).some(icon => icon.id === brake.id), query);
  }
  assert.equal(filterIcons(catalog.icons, { query: brake.exportName })[0].id, brake.id);
});

test('search supports multiple terms and one-character spelling mistakes', () => {
  assert.ok(filterIcons(catalog.icons, { query: 'brak' }).some(icon => icon.id === brake.id));
  assert.ok(filterIcons(catalog.icons, { query: 'space brake' }).some(icon => icon.id === brake.id));
  assert.equal(filterIcons(catalog.icons, { query: 'a-term-that-is-certainly-absent-999' }).length, 0);
});

test('category, source, and naming filters combine', () => {
  const results = filterIcons(catalog.icons, { category: brake.category, source: 'mdi-alias', status: brake.naming.status });
  assert.ok(results.some(icon => icon.id === brake.id));
  assert.ok(results.every(icon => icon.category === brake.category && icon.source.kind === 'mdi-alias' && icon.naming.status === brake.naming.status));
  assert.equal(filterIcons(catalog.icons, { status: 'confirmed' }).length, catalog.icons.filter(icon => icon.naming.status === 'confirmed').length);
});

test('public source filters include all applicable origins without duplicating mixed-source icons', () => {
  const manned = catalog.icons.find(icon => icon.exportName === 'scmdiTurretManned');
  const original = filterIcons(catalog.icons, { origin: 'original' });
  const mdiOriginal = filterIcons(catalog.icons, { origin: 'mdi-alias' });
  const mdiModified = filterIcons(catalog.icons, { origin: 'mdi-derived' });
  const game = filterIcons(catalog.icons, { origin: 'game' });
  assert.equal(original.length, 46);
  assert.equal(mdiOriginal.length, 6);
  assert.equal(mdiModified.length, 30);
  assert.equal(game.length, 69);
  assert.ok(mdiOriginal.every(icon => icon.source.kind === 'mdi-alias'));
  assert.ok(mdiModified.some(icon => icon.source.kind === 'mdi-derived'));
  assert.ok(mdiModified.some(icon => icon.id === manned.id));
  assert.ok(!mdiOriginal.some(icon => icon.id === manned.id));
  assert.ok(game.some(icon => icon.id === manned.id));
  assert.ok(!original.some(icon => icon.id === manned.id));
  assert.equal(new Set(mdiModified.map(icon => icon.id)).size, mdiModified.length);
  assert.deepEqual(filterIcons(catalog.icons, { query: 'mdiAccount', origin: 'mdi-derived' }).map(icon => icon.id), [manned.id]);
  assert.equal(filterIcons(catalog.icons, { query: 'mdiAccount', origin: 'mdi-alias' }).length, 0);
  assert.deepEqual(filterIcons(catalog.icons, { query: 'mdiAccount', origin: 'game' }).map(icon => icon.id), [manned.id]);
  assert.equal(filterIcons(catalog.icons, { query: 'mdiAccount', origin: 'original' }).length, 0);
  assert.deepEqual(sourceGroups({ source: { kind: 'mdi-derived', additionalSources: [{ kind: 'mdi-derived' }] } }), ['mdi-derived']);
});

test('review changes preserve IDs, paths, provenance, and original input', () => {
  const result = applyReviewPatch(catalog, patch());
  const changed = result.icons.find(icon => icon.id === brake.id);
  assert.equal(changed.exportName, 'scmdiSpaceBrakeNew');
  assert.equal(changed.path, brake.path);
  assert.deepEqual(changed.source, brake.source);
  assert.equal(brake.exportName, originalBrakeName);
  assert.notEqual(result.revision, catalog.revision);
});

test('review rejects stale revisions, conflicting names, unknown IDs, and executable identifiers', () => {
  assert.throws(() => applyReviewPatch(catalog, { ...patch(), baseRevision: 'stale' }), /版本/);
  assert.throws(() => applyReviewPatch(catalog, patch({ exportName: 'scmdiShip' })), /重复/);
  assert.throws(() => applyReviewPatch(catalog, patch({ id: 'icon-9999' })), /不存在/);
  assert.throws(() => applyReviewPatch(catalog, patch({ exportName: 'scmdiFoo;process.exit()' })), /名称/);
  assert.throws(() => applyReviewPatch(catalog, patch({ candidates: ['<svg>'] })), /候选/);
  assert.throws(() => applyReviewPatch(catalog, { ...patch(), changes: [...patch().changes, ...patch().changes] }), /重复/);
});

test('local overlays keep path data and make candidate names searchable', () => {
  const entry = { exportName: 'scmdiSpaceBrakeDraft', status: 'draft', candidates: ['scmdiSpaceStop'], notes: '' };
  const icons = overlayEdits(catalog.icons, { [brake.id]: entry });
  assert.equal(icons.find(icon => icon.id === brake.id).path, brake.path);
  assert.ok(filterIcons(icons, { query: 'scmdiSpaceStop' }).some(icon => icon.id === brake.id));
});

test('applying a review clears applied drafts and removed IDs while preserving later changes', () => {
  const other = catalog.icons.find(icon => icon.id !== brake.id);
  const appliedEdit = { exportName: brake.exportName, candidates: brake.naming.candidates, notes: brake.naming.notes, status: 'draft' };
  const laterEdit = { exportName: 'scmdiLaterReview', candidates: [], notes: 'Keep this subsequent change', status: 'draft' };
  const edits = { [brake.id]: appliedEdit, [other.id]: laterEdit, 'icon-9999': laterEdit };
  const reconciled = reconcileReviewEdits(catalog.icons, edits, [brake.id]);
  assert.deepEqual(reconciled, { [other.id]: laterEdit });
  assert.ok(edits[brake.id]);
  if (brake.naming.status !== 'draft') assert.deepEqual(reconcileReviewEdits(catalog.icons, { [brake.id]: appliedEdit }), { [brake.id]: appliedEdit });
});

test('confirmed names still require source review before release', () => {
  assert.deepEqual(validateCatalog(catalog), []);
  const icon = {
    id: 'icon-0001',
    exportName: 'scmdiFixture',
    path: 'M0 0H24V24H0Z',
    naming: { status: 'confirmed' },
    source: { kind: 'original', license: 'Apache-2.0', reviewed: false },
  };
  const draft = { schemaVersion: 1, icons: [icon] };
  assert.deepEqual(validateCatalog(draft), []);
  assert.match(validateCatalog(draft, { release: true })[0], /^Release blocked: icon-0001/);
});

test('SVG export has the MDI coordinate system and escapes attributes', () => {
  assert.match(svgMarkup(brake.path), /viewBox="0 0 24 24"/);
  assert.match(svgMarkup('M0 0" onload="alert(1)'), /&quot;/);
  assert.doesNotMatch(svgMarkup('M0 0" onload="alert(1)'), /d="M0 0" onload=/);
});

test('MDI derivation can be recorded before upstream identification without passing the release gate', () => {
  const icon = {
    ...brake, naming: { ...brake.naming, status: 'confirmed' },
    source: { kind: 'mdi-derived', modified: true, reviewed: false, license: null, file: 'fixture.svg' },
  };
  const draft = { schemaVersion: 1, icons: [icon] };
  assert.deepEqual(validateCatalog(draft), []);
  assert.ok(validateCatalog(draft, { release: true }).some(error => error.startsWith('Release blocked:')));
  const prematurelyReviewed = { ...draft, icons: [{ ...icon, source: { ...icon.source, reviewed: true, license: 'Apache-2.0' } }] };
  assert.ok(validateCatalog(prematurelyReviewed).some(error => error.startsWith('Incomplete MDI derivative source:')));
  assert.ok(validateCatalog(prematurelyReviewed, { release: true }).some(error => error.startsWith('Release blocked:')));
  const complete = { ...draft, icons: [{ ...icon, source: { ...icon.source, reviewed: true, license: 'Apache-2.0', mdiName: 'camera', changes: 'Modified the frame.' } }] };
  assert.deepEqual(validateCatalog(complete, { release: true }), []);
  assert.ok(validateCatalog({ ...draft, icons: [{ ...icon, source: { ...icon.source, modified: false } }] }).length);
});

test('game reference redraws retain their own provenance and require verified licensing for release', () => {
  const icon = {
    ...brake, naming: { ...brake.naming, status: 'confirmed' },
    source: { kind: 'game-derived', modified: true, reviewed: false, license: null, file: 'fixture.svg', reference: 'Star Citizen in-game assets', changes: 'Redrawn and further modified.' },
  };
  const draft = { schemaVersion: 1, icons: [icon] };
  assert.deepEqual(validateCatalog(draft), []);
  assert.ok(validateCatalog(draft, { release: true }).some(error => error.startsWith('Release blocked:')));
  const licenseMissing = { ...draft, icons: [{ ...icon, source: { ...icon.source, reviewed: true } }] };
  assert.ok(validateCatalog(licenseMissing, { release: true }).some(error => error.startsWith('Release blocked:')));
  const referenceMissing = { ...draft, icons: [{ ...icon, source: { ...icon.source, reference: '' } }] };
  assert.ok(validateCatalog(referenceMissing).some(error => error.startsWith('Incomplete game-derived source:')));
});

test('every component of mixed-source artwork must be verified before release', () => {
  const component = { kind: 'mdi-derived', modified: true, mdiName: 'account', license: null, reviewed: false };
  const icon = {
    ...brake, naming: { ...brake.naming, status: 'confirmed' },
    source: { kind: 'game-derived', modified: true, reviewed: true, license: 'Apache-2.0', file: 'fixture.svg', reference: 'Star Citizen in-game assets', changes: 'Adapted game reference.', additionalSources: [component] },
  };
  const draft = { schemaVersion: 1, icons: [icon] };
  assert.deepEqual(validateCatalog(draft), []);
  assert.ok(validateCatalog(draft, { release: true }).some(error => error.startsWith('Release blocked:')));
  const complete = { ...draft, icons: [{ ...icon, source: { ...icon.source, additionalSources: [{ ...component, reviewed: true, license: 'Apache-2.0', changes: 'Modified the person silhouette.' }] } }] };
  assert.deepEqual(validateCatalog(complete, { release: true }), []);
  const invalid = { ...draft, icons: [{ ...icon, source: { ...icon.source, additionalSources: [{ ...component, mdiName: '' }] } }] };
  assert.ok(validateCatalog(invalid).some(error => error.startsWith('Incomplete additional source:')));
});
