import { Button, Glyph } from './material';
import Tooltip from './Tooltip';
import './code-actions.css';

export default function ExportActions({ label, downloadLabel, pngLabel, onDownload, onDownloadPng }: { label: string; downloadLabel: string; pngLabel: string; onDownload: () => void; onDownloadPng: () => void }) {
  return <div className="export-actions" role="group" aria-label={label}>
    <Button color="filled" size="md" className="export-download" aria-label={downloadLabel} onClick={onDownload}><Glyph name="download" size={20} /><span className="export-full-label">{downloadLabel}</span><span className="export-short-label" aria-hidden="true">SVG</span></Button>
    <Tooltip text={pngLabel} className="export-action-png"><Button color="tonal" size="md" className="export-png" aria-label={pngLabel} onClick={onDownloadPng}>PNG</Button></Tooltip>
  </div>;
}
