import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@mdi/react';
import { Button, IconButton, MaterialRipple, MaterialSlider, MaterialTab, MaterialTabs, Glyph, Modal, ScrollSurface } from './material';
import LicenseModal from './LicenseModal';
import LanguageMenu from './LanguageMenu';
import SourceFilterMenu, { type SourceFilter } from './SourceFilterMenu';
import GridDensityControl, { type GridDensity } from './GridDensityControl';
import IconPreview from './IconPreview';
import CodePanel from './CodePanel';
import ExportActions from './ExportActions';
import { downloadPng } from './export-png';
import { iconDescription, iconLabel, messages, useLanguage, type Language } from './i18n';
import { communityNotice } from './community-notice';
import './language-control.css';
import rawCatalog from '../../../icons/catalog.json';
import { filterIcons, sourceGroups, svgMarkup } from './library.mjs';
import type { Catalog, IconRecord } from './types';

const catalog = rawCatalog as Catalog;
const initial = new URLSearchParams(location.hash.slice(1));
const resolveId = (id: string) => catalog.redirects?.[id] ?? id;
const iconSlug = (name: string) => name.replace(/^scmdi/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const ship = catalog.icons.find(icon => icon.exportName === 'scmdiShip') ?? catalog.icons[0];
const parseSourceFilter = (value: string | null): SourceFilter => value === 'original' || value === 'mdi-alias' || value === 'mdi-derived' || value === 'game' ? value : 'all';

function download(icon: IconRecord) {
  const url = URL.createObjectURL(new Blob([svgMarkup(icon.path)], { type: 'image/svg+xml' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${iconSlug(icon.exportName)}.svg`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function useCompactLayout() {
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 1000px)').matches);
  useEffect(() => {
    const media = matchMedia('(max-width: 1000px)');
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return compact;
}

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [query, setQuery] = useState(initial.get('q') ?? '');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>(() => parseSourceFilter(initial.get('source')));
  const [selectedId, setSelectedId] = useState(resolveId(initial.get('icon') ?? ship.id));
  const [detailOpen, setDetailOpen] = useState(initial.has('icon'));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('scmdi:theme') === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });
  const [density, setDensity] = useState<GridDensity>('medium');
  const size = density === 'compact' ? 24 : density === 'large' ? 48 : 32;
  const [toast, setToast] = useState<'' | 'copied' | 'copyFailed' | 'pngFailed'>('');
  const [licenseOpen, setLicenseOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const compact = useCompactLayout();
  const results = useMemo(() => filterIcons(catalog.icons, { query, origin: sourceFilter }) as IconRecord[], [query, sourceFilter]);
  const sourceCounts = useMemo(() => {
    const matches = filterIcons(catalog.icons, { query }) as IconRecord[];
    const counts: Record<SourceFilter, number> = { all: matches.length, original: 0, 'mdi-alias': 0, 'mdi-derived': 0, game: 0 };
    for (const icon of matches) for (const group of sourceGroups(icon)) counts[group as SourceFilter]++;
    return counts;
  }, [query]);
  const selected = catalog.icons.find(icon => icon.id === selectedId);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f8f7fc' : '#141218');
    try { localStorage.setItem('scmdi:theme', theme); } catch { /* Theme still works without storage. */ }
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (sourceFilter !== 'all') params.set('source', sourceFilter);
    if (selectedId) params.set('icon', selectedId);
    history.replaceState(null, '', `${location.pathname}${location.search}#${params}`);
  }, [query, selectedId, sourceFilter]);

  useEffect(() => {
    const navigate = () => {
      const params = new URLSearchParams(location.hash.slice(1));
      setQuery(params.get('q') ?? '');
      setSourceFilter(parseSourceFilter(params.get('source')));
      setSelectedId(resolveId(params.get('icon') ?? ship.id));
      setDetailOpen(params.has('icon'));
    };
    const keydown = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;
      const typing = event.composedPath().some(target => target instanceof HTMLElement && target.matches('input, textarea, select, [contenteditable="true"]'));
      if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') || (!typing && event.key === '/')) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('popstate', navigate);
    window.addEventListener('hashchange', navigate);
    window.addEventListener('keydown', keydown);
    return () => {
      window.removeEventListener('popstate', navigate);
      window.removeEventListener('hashchange', navigate);
      window.removeEventListener('keydown', keydown);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setToast('copied'); }
    catch { setToast('copyFailed'); }
  }

  function selectIcon(icon: IconRecord) {
    if (icon.id !== selectedId) {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      params.set('icon', icon.id);
      history.pushState(null, '', `#${params}`);
      setSelectedId(icon.id);
    }
    setDetailOpen(true);
  }

  const details = selected ? <Inspector key={selected.id} icon={selected} language={language} onCopy={copy} onExportError={() => setToast('pngFailed')} onClose={compact ? () => setDetailOpen(false) : undefined} />
    : <ScrollSurface header={<div className="inspector-top"><span>{t.details}</span>{compact && <IconButton data-dialog-close aria-label={t.closeDetails} onClick={() => setDetailOpen(false)}><Glyph name="close" /></IconButton>}</div>}><div className="missing-icon"><Glyph name="search" size={36} /><h2>{t.missingIcon}</h2><Button color="tonal" onClick={() => selectIcon(ship)}>{t.backToLibrary}</Button></div></ScrollSurface>;

  return <div className="app">
    <a className="skip-link" href="#catalog" onClick={event => { event.preventDefault(); document.getElementById('catalog')?.focus(); }}>{t.skipToIcons}</a>
    <header className="topbar">
      <a className="brand" href="#" onClick={event => { event.preventDefault(); setQuery(''); setSourceFilter('all'); window.scrollTo({ top: 0, behavior: 'instant' }); }} aria-label={t.home}>
        <span className="brand-symbol"><Icon path={ship.path} size="25px" aria-hidden="true" /></span>
        <span>scmdi<span className="brand-dot">.</span></span>
      </a>
      <span className="brand-caption">{t.caption}</span>
      <div className="top-actions">
        <LanguageMenu language={language} onChange={setLanguage} label={t.language} currentLabel={t.currentLanguage} />
        <IconButton aria-label={theme === 'light' ? t.darkTheme : t.lightTheme} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}><Glyph name={theme === 'light' ? 'moon' : 'sun'} /></IconButton>
        <a className="github-link" href="https://github.com/GrakePch/scmdi" aria-label="GitHub" target="_blank" rel="noreferrer"><Glyph name="github" size={20} /><span>GitHub</span><Glyph name="external" size={15} /></a>
      </div>
    </header>
    <main className="workspace" id="catalog" tabIndex={-1}>
      <section className="library" aria-labelledby="library-title">
        <div className="search-box"><Glyph name="search" size={24} />
          <input ref={searchRef} type="search" aria-label={t.search} value={query} onChange={event => setQuery(event.target.value)} placeholder={t.searchPlaceholder} autoComplete="off" spellCheck={false} />
          {query ? <IconButton aria-label={t.clearSearch} onClick={() => { setQuery(''); searchRef.current?.focus(); }}><Glyph name="close" size={20} /></IconButton> : <kbd>Ctrl K</kbd>}
        </div>
        <div className="results-toolbar">
          <div className="results-summary">
            <div className="results-heading"><h1 id="library-title">{query ? t.searchResults : sourceFilter !== 'all' ? t.filteredIcons : t.allIcons}</h1><span className="result-count" role="status" aria-label={t.iconCount(results.length)}>{new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en').format(results.length)}</span></div>
            <SourceFilterMenu value={sourceFilter} onChange={setSourceFilter} counts={sourceCounts} label={t.sourceFilter} currentLabel={t.currentFilter} countLabel={t.iconCount} locale={language === 'zh' ? 'zh-CN' : 'en'} labels={{ all: t.sourceAll, original: t.sourceOriginal, 'mdi-alias': t.sourceMdiAlias, 'mdi-derived': t.sourceMdiDerived, game: t.sourceGame }} />
          </div>
          <GridDensityControl value={density} onChange={setDensity} labels={{ group: t.gridDensity, large: t.gridLarge, medium: t.gridMedium, compact: t.gridCompact }} />
        </div>
        {results.length ? <div className="icon-grid" data-density={density} aria-label={t.resultGrid}>{results.map(icon => <button type="button" key={icon.id} className={`icon-card ${selectedId === icon.id ? 'is-selected' : ''}`} title={`${icon.exportName} · ${iconLabel(icon, language)}`} aria-label={`${icon.exportName} · ${iconLabel(icon, language)}`} aria-pressed={selectedId === icon.id} aria-haspopup={compact ? 'dialog' : undefined} onClick={() => selectIcon(icon)}>
          <MaterialRipple />{selectedId === icon.id && density !== 'compact' && <span className="selection-mark"><Glyph name="check" size={13} /></span>}
          <span className="card-preview"><Icon path={icon.path} size={`${size}px`} aria-hidden="true" /></span>
          {density !== 'compact' && <><span className="card-name" title={iconSlug(icon.exportName)}>{iconSlug(icon.exportName)}</span>{language === 'zh' && <span className="card-label">{icon.label.zh}</span>}</>}
        </button>)}</div> : <div className="empty-state"><div className="empty-symbol"><Glyph name="search" size={32} /></div><h2>{t.noResults}</h2><Button color="tonal" onClick={() => { setQuery(''); setSourceFilter('all'); }}>{t.showAll}</Button></div>}
        <footer className="library-footer"><span>SCMDI</span><button onClick={() => setLicenseOpen(true)} aria-haspopup="dialog">{t.license} <Glyph name="external" size={13} /></button><span className="footer-format">SVG · 24 × 24</span><div className="site-disclaimer">{communityNotice[language].shortText} <a href={communityNotice[language].officialLink.href} target="_blank" rel="noreferrer">{communityNotice[language].officialLink.label} <Glyph name="external" size={12} /></a></div></footer>
      </section>
      {!compact && <aside className="inspector" aria-label={t.details}>{details}</aside>}
    </main>
    {compact && detailOpen && !licenseOpen && <Modal className="detail-modal" labelledBy={selected ? 'detail-title' : undefined} label={t.details} onClose={() => setDetailOpen(false)}>{details}</Modal>}
    {licenseOpen && <LicenseModal language={language} onClose={() => setLicenseOpen(false)} />}
    {toast && <div className="snackbar" role="status"><Glyph name="check" size={20} />{t[toast]}</div>}
  </div>;
}

function Inspector({ icon, language, onCopy, onExportError, onClose }: { icon: IconRecord; language: Language; onCopy: (text: string) => Promise<void>; onExportError: () => void; onClose?: () => void }) {
  const t = messages[language];
  const label = iconLabel(icon, language);
  const description = iconDescription(icon, language);
  const [tab, setTab] = useState(0);
  const [previewSize, setPreviewSize] = useState(80);
  const [color, setColor] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const formats = ['React', 'Path', 'SVG'];
  const code = tab === 0 ? `import Icon from '@mdi/react';\nimport { ${icon.exportName} }\n  from '${catalog.packageName}';\n\n<Icon path={${icon.exportName}} size={1} />` : tab === 1 ? icon.path : svgMarkup(icon.path);
  return <ScrollSurface header={<div className="inspector-top"><span>{t.details}</span><div><IconButton aria-label={t.copyLink} onClick={() => { const params = new URLSearchParams(); params.set('icon', icon.id); void onCopy(`${location.origin}${location.pathname}${location.search}#${params}`); }}><Glyph name="link" size={20} /></IconButton>{onClose && <IconButton data-dialog-close aria-label={t.closeDetails} onClick={onClose}><Glyph name="close" /></IconButton>}</div></div>}>
    <div className="detail-content">
    <div className="detail-preview-section">
    <IconPreview path={icon.path} size={previewSize} color={color} elementRef={previewRef} />
    <div className="detail-preview-settings">
    <div className="preview-controls"><div className="swatches" role="group" aria-label={t.previewColors}>{[null, '#528b6b', '#c06a48', '#6384c9', '#000000', '#ffffff'].map(value => <button type="button" key={value ?? 'theme'} className={`swatch ${value === color ? 'selected' : ''}`} style={{ backgroundColor: value ?? 'var(--md-sys-color-primary)' }} aria-label={value ? t.previewColor(value) : t.themeColor} aria-pressed={value === color} onClick={() => setColor(value)} />)}<label className="custom-color"><input type="color" aria-label={t.customColor} value={color ?? '#6750a4'} onChange={event => setColor(event.target.value)} /><Glyph name="plus" size={16} /></label></div><output>{previewSize} px</output></div>
    <MaterialSlider className="preview-slider" aria-label={t.previewSize} min={24} max={120} step={8} value={previewSize} onInput={event => setPreviewSize((event.currentTarget as HTMLElement & { value: number }).value)} />
    </div>
    </div>
    <div className="detail-title"><h2 id="detail-title">{icon.exportName}</h2><p>{label}</p></div>
    <section className="usage" aria-label={t.usage}>
      <div className="code-tabs"><MaterialTabs role="tablist" activeTabIndex={tab} onChange={event => setTab((event.currentTarget as HTMLElement & { activeTabIndex: number }).activeTabIndex)} aria-label={t.codeFormat}>{formats.map((value, index) => <MaterialTab key={value} role="tab" aria-selected={tab === index} id={`code-tab-${index}`} aria-controls="code-panel">{value}</MaterialTab>)}</MaterialTabs></div>
      <CodePanel code={code} labelledBy={`code-tab-${tab}`} copyLabel={t.copyCode(formats[tab])} onCopy={() => void onCopy(code)} />
      <ExportActions label={t.exportActions} downloadLabel={t.downloadSvg} pngLabel={t.downloadPng} onDownload={() => download(icon)} onDownloadPng={() => {
        const resolvedColor = color ?? getComputedStyle(previewRef.current!).color;
        void downloadPng({ path: icon.path, name: iconSlug(icon.exportName), color: resolvedColor, size: previewSize }).catch(onExportError);
      }} />
    </section>
    {description && description !== label && <p className="purpose-text">{description}</p>}
    <div className="detail-metadata">
    {icon.actions.length > 0 && <details className="detail-disclosure"><summary>{t.actions} <span>{icon.actions.length}</span><Glyph name="chevron" size={18} /></summary><div className="action-ids">{icon.actions.map(action => <code key={action}>{action}</code>)}</div></details>}
    <details className="detail-disclosure provenance"><summary>{t.provenance}<Glyph name="chevron" size={18} /></summary>
      <div className="provenance-content">
      {icon.source.kind === 'mdi-alias' ? <><a href={`https://pictogrammers.com/library/mdi/icon/${icon.source.mdiName}/`} target="_blank" rel="noreferrer">{icon.source.mdiExport} <Glyph name="external" size={13} /></a><p>{[icon.source.author, icon.source.version, icon.source.license].filter(Boolean).join(' · ')}</p></>
        : icon.source.kind === 'original' ? <><p>{t.originalSource}</p><p>{[icon.source.author, icon.source.license ?? t.licenseUnavailable].filter(Boolean).join(' · ')}</p></>
        : icon.source.kind === 'game-derived' ? <><p>{icon.source.adaptation === 'redrawn' ? t.gameRedrawn : t.gameProcessed}</p><p>{[icon.source.author, icon.source.license ?? t.licenseUnavailable].filter(Boolean).join(' · ')}</p></>
        : icon.source.kind === 'mdi-derived' ? <><p>{icon.source.url ? <a href={icon.source.url} target="_blank" rel="noreferrer">{t.derivedFromMdi(icon.source.mdiName!)} <Glyph name="external" size={13} /></a> : icon.source.mdiName ? t.derivedFromMdi(icon.source.mdiName) : t.mdiDerivative}</p>{icon.source.changes && icon.source.changes !== `Modified from MDI ${icon.source.mdiName} for SCMDI.` && (language === 'zh' || !/[\u3400-\u9fff]/.test(icon.source.changes)) && <p>{icon.source.changes}</p>}<p>{[icon.source.author, icon.source.version, icon.source.license ?? t.licenseUnavailable].filter(Boolean).join(' · ')}</p></> : <p>{t.sourceUnavailable}</p>}
      {icon.source.referenceVersion && <p>{icon.source.referenceVersionEvidence ? <a href={icon.source.referenceVersionEvidence} target="_blank" rel="noreferrer">{t.mdiReferenceVersion(icon.source.referenceVersion)} <Glyph name="external" size={13} /></a> : t.mdiReferenceVersion(icon.source.referenceVersion)}</p>}
      {(icon.source.additionalSources ?? []).map((source, index) => <div className="additional-source" key={`${source.mdiName}-${index}`}>
        <a href={`https://pictogrammers.com/library/mdi/icon/${source.mdiName}/`} target="_blank" rel="noreferrer">{t.additionalMdiSource(source.mdiName)} <Glyph name="external" size={13} /></a>
        {source.changes && source.changes !== `Modified from MDI ${source.mdiName} for SCMDI.` && (language === 'zh' || !/[\u3400-\u9fff]/.test(source.changes)) && <p>{source.changes}</p>}
        <p>{[source.author, source.version, source.license ?? t.licenseUnavailable].filter(Boolean).join(' · ')}</p>
        {source.referenceVersion && <p>{source.referenceVersionEvidence ? <a href={source.referenceVersionEvidence} target="_blank" rel="noreferrer">{t.mdiReferenceVersion(source.referenceVersion)} <Glyph name="external" size={13} /></a> : t.mdiReferenceVersion(source.referenceVersion)}</p>}
      </div>)}
      {icon.source.repository && icon.source.commit && <a href={`${icon.source.repository}/blob/${icon.source.commit}/${icon.source.file}`} target="_blank" rel="noreferrer">{t.sourceFile} <Glyph name="external" size={13} /></a>}
      </div>
    </details>
    </div>
    </div>
  </ScrollSurface>;
}
