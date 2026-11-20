export function validateCatalog(catalog, { release = false } = {}) {
  const errors = [];
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.icons) || !catalog.icons.length) return ['Invalid or empty catalog.'];
  const ids = new Set();
  const names = new Map();
  for (const icon of catalog.icons) {
    if (!/^icon-\d{4}$/.test(icon.id) || ids.has(icon.id)) errors.push(`Invalid or duplicate ID: ${icon.id}`);
    ids.add(icon.id);
    for (const name of [icon.exportName, ...(icon.exportAliases ?? [])]) {
      if (!/^scmdi[A-Z][A-Za-z0-9]*$/.test(name)) errors.push(`Invalid export name: ${name}`);
      if (names.has(name)) errors.push(`Duplicate export name: ${name}`);
      names.set(name, icon.id);
    }
    if (typeof icon.path !== 'string' || !/^[Mm]/.test(icon.path) || /[^MmZzLlHhVvCcSsQqTtAaEe0-9+.,\s-]/.test(icon.path)) errors.push(`Invalid path data: ${icon.id}`);
    if (!['draft', 'confirmed'].includes(icon.naming?.status)) errors.push(`Invalid naming status: ${icon.id}`);
    if (!['unreviewed', 'original', 'mdi-alias', 'mdi-derived', 'game-derived'].includes(icon.source?.kind)) errors.push(`Invalid source kind: ${icon.id}`);
    if (icon.source?.kind === 'mdi-alias' && (!icon.source.mdiName || !icon.source.version || icon.source.modified !== false)) errors.push(`Incomplete MDI alias source: ${icon.id}`);
    const incompleteDerivative = icon.source?.kind === 'mdi-derived' && (!icon.source.mdiName || !icon.source.changes || icon.source.modified !== true);
    if (icon.source?.kind === 'mdi-derived' && (icon.source.modified !== true || (icon.source.reviewed && incompleteDerivative))) errors.push(`Incomplete MDI derivative source: ${icon.id}`);
    const incompleteGameReference = icon.source?.kind === 'game-derived' && (!icon.source.reference || !icon.source.changes || icon.source.modified !== true);
    if (incompleteGameReference) errors.push(`Incomplete game-derived source: ${icon.id}`);
    const additionalSources = Array.isArray(icon.source?.additionalSources) ? icon.source.additionalSources : [];
    const invalidAdditionalSources = icon.source?.additionalSources !== undefined && !Array.isArray(icon.source.additionalSources);
    if (invalidAdditionalSources) errors.push(`Invalid additional sources: ${icon.id}`);
    const invalidAdditional = source => !source || source.kind !== 'mdi-derived' || !source.mdiName || source.modified !== true;
    for (const source of additionalSources) {
      if (invalidAdditional(source) || (source.reviewed && !source.changes)) errors.push(`Incomplete additional source: ${icon.id}`);
    }
    const pendingAdditionalSource = invalidAdditionalSources || additionalSources.some(source => invalidAdditional(source) || !source.reviewed || source.license !== 'Apache-2.0' || !source.changes);
    if (release && (icon.naming.status !== 'confirmed' || icon.source.kind === 'unreviewed' || icon.source.license !== 'Apache-2.0' || !icon.source.reviewed || incompleteDerivative || incompleteGameReference || pendingAdditionalSource)) errors.push(`Release blocked: ${icon.id} (${icon.exportName}) needs confirmed naming and verified Apache-2.0 provenance.`);
  }
  for (const icon of catalog.icons) {
    if (icon.aliasOf && (!ids.has(icon.aliasOf) || icon.aliasOf === icon.id || catalog.icons.find(other => other.id === icon.aliasOf)?.path !== icon.path)) errors.push(`Invalid shared-path reference: ${icon.id}`);
  }
  return errors;
}
