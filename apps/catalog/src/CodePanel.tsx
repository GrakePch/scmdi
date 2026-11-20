import { Button, Glyph } from './material';
import Tooltip from './Tooltip';
import './code-actions.css';

export default function CodePanel({ code, labelledBy, copyLabel, onCopy }: { code: string; labelledBy: string; copyLabel: string; onCopy: () => void }) {
  return <div className="code-surface copyable-code">
    <pre id="code-panel" className="code-block" role="tabpanel" aria-labelledby={labelledBy} tabIndex={0}><code>{code}</code></pre>
    <Tooltip text={copyLabel} className="code-copy-action"><Button color="text" className="code-copy-button" aria-label={copyLabel} onClick={onCopy}><Glyph name="copy" size={19} /></Button></Tooltip>
  </div>;
}
