import React, { useId, useRef, useState } from 'react';
import { createComponent, type EventName } from '@lit/react';
import { MdMenu, FocusState, type CloseMenuEvent } from '@material/web/menu/menu.js';
import { MdMenuItem } from '@material/web/menu/menu-item.js';
import { Button, Glyph } from './material';
import './source-filter.css';

const Menu = createComponent({ react: React, tagName: 'md-menu', elementClass: MdMenu, events: { onOpening: 'opening' as EventName<Event>, onClosed: 'closed' as EventName<Event> } });
const MenuItem = createComponent({ react: React, tagName: 'md-menu-item', elementClass: MdMenuItem, events: { onCloseMenu: 'close-menu' as EventName<CloseMenuEvent> } });
export type SourceFilter = 'all' | 'original' | 'mdi-alias' | 'mdi-derived' | 'game';
const options: SourceFilter[] = ['all', 'original', 'mdi-alias', 'mdi-derived', 'game'];

export default function SourceFilterMenu({ value, onChange, counts, labels, label, currentLabel, countLabel, locale }: {
  value: SourceFilter;
  onChange: (value: SourceFilter) => void;
  counts: Record<SourceFilter, number>;
  labels: Record<SourceFilter, string>;
  label: string;
  currentLabel: string;
  countLabel: (count: number) => string;
  locale: string;
}) {
  const id = `source-filter-${useId().replace(/:/g, '')}`;
  const menuRef = useRef<MdMenu>(null);
  const [open, setOpen] = useState(false);
  function show(last = false) {
    const menu = menuRef.current;
    if (!menu) return;
    menu.defaultFocus = last ? FocusState.LAST_ITEM : FocusState.FIRST_ITEM;
    menu.show();
  }
  return <div className="source-filter">
    <Button id={id} className="source-filter-trigger" color={value === 'all' ? 'tonal' : 'filled'}
      aria-label={`${label}: ${labels[value]}`} aria-haspopup="menu" aria-expanded={open} aria-controls={`${id}-menu`}
      onClick={() => open ? menuRef.current?.close() : show()}
      onKeyDown={event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        show(event.key === 'ArrowUp');
      }}>
      <span>{labels[value]}</span><Glyph name="chevron" size={16} />
    </Button>
    <Menu ref={menuRef} id={`${id}-menu`} anchor={id} positioning="popover" anchorCorner="end-end" menuCorner="start-end" yOffset={6}
      role="menu" aria-label={label} onOpening={() => setOpen(true)} onClosed={() => setOpen(false)}>
      {options.map(option => <MenuItem key={option} type="button" data-source={option} data-selected={value === option}
        aria-label={`${labels[option]}, ${countLabel(counts[option])}${value === option ? `, ${currentLabel}` : ''}`}
        onCloseMenu={event => {
          const reason = event.detail.reason;
          if (reason.kind === 'click-selection' || reason.key === 'Enter' || reason.key === 'Space') onChange(option);
        }}>
        <span slot="start" className="source-filter-check">{value === option && <Glyph name="check" size={20} />}</span>
        <span slot="headline">{labels[option]}</span>
        <span slot="end" className="source-filter-count">{new Intl.NumberFormat(locale).format(counts[option])}</span>
      </MenuItem>)}
    </Menu>
  </div>;
}
