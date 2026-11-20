import type { KeyboardEvent } from 'react';
import { Button, Glyph } from './material';
import './density-control.css';

export type GridDensity = 'large' | 'medium' | 'compact';

const views = [
  { value: 'large', symbol: 'gridLarge' },
  { value: 'medium', symbol: 'gridMedium' },
  { value: 'compact', symbol: 'gridCompact' },
] as const;

interface GridDensityControlProps {
  value: GridDensity;
  onChange: (value: GridDensity) => void;
  labels: { group: string; large: string; medium: string; compact: string };
}

export default function GridDensityControl({ value, onChange, labels }: GridDensityControlProps) {
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const current = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-density]');
    if (!current) return;
    const index = views.findIndex(view => view.value === current.dataset.density);
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    let next: number;
    switch (event.key) {
      case 'ArrowRight': next = index + (rtl ? -1 : 1); break;
      case 'ArrowLeft': next = index + (rtl ? 1 : -1); break;
      case 'ArrowDown': next = index + 1; break;
      case 'ArrowUp': next = index - 1; break;
      case 'Home': next = 0; break;
      case 'End': next = views.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const selected = views[(next + views.length) % views.length].value;
    onChange(selected);
    event.currentTarget.querySelector<HTMLButtonElement>(`button[data-density="${selected}"]`)?.focus();
  }

  return <div className="density-control" role="radiogroup" aria-label={labels.group} onKeyDown={navigate}>
    {views.map(view => <Button
      key={view.value}
      className="density-segment"
      color="tonal"
      size="sm"
      role="radio"
      aria-label={labels[view.value]}
      title={labels[view.value]}
      aria-checked={value === view.value}
      tabIndex={value === view.value ? 0 : -1}
      data-density={view.value}
      onClick={() => onChange(view.value)}
    ><Glyph name={view.symbol} size={20} /></Button>)}
  </div>;
}
