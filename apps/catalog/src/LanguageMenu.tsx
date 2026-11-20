import React, { useId, useRef, useState } from 'react';
import { createComponent, type EventName } from '@lit/react';
import { MdMenu, FocusState, type CloseMenuEvent } from '@material/web/menu/menu.js';
import { MdMenuItem } from '@material/web/menu/menu-item.js';
import { Button, Glyph } from './material';
import type { Language } from './i18n';
import './language-menu.css';

const Menu = createComponent({
  react: React,
  tagName: 'md-menu',
  elementClass: MdMenu,
  events: { onOpening: 'opening' as EventName<Event>, onClosed: 'closed' as EventName<Event> },
});
const MenuItem = createComponent({
  react: React, tagName: 'md-menu-item', elementClass: MdMenuItem,
  events: { onCloseMenu: 'close-menu' as EventName<CloseMenuEvent> },
});

export default function LanguageMenu({ language, onChange, label, currentLabel }: {
  language: Language;
  onChange: (language: Language) => void;
  label: string;
  currentLabel: string;
}) {
  const id = `language-${useId().replace(/:/g, '')}`;
  const menuRef = useRef<MdMenu>(null);
  const [open, setOpen] = useState(false);
  const current = language === 'zh' ? '中文' : 'English';

  function show(last = false) {
    const menu = menuRef.current;
    if (!menu) return;
    menu.defaultFocus = last ? FocusState.LAST_ITEM : FocusState.FIRST_ITEM;
    menu.show();
  }

  return <div className="language-menu">
    <Button id={id} className="language-menu-trigger" color="tonal" size="sm"
      aria-label={`${label}: ${current}`} aria-haspopup="menu" aria-expanded={open} aria-controls={`${id}-menu`}
      onClick={() => open ? menuRef.current?.close() : show()}
      onKeyDown={event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        show(event.key === 'ArrowUp');
      }}>
      <span lang={language === 'zh' ? 'zh-CN' : 'en'} className="language-menu-current">{current}</span>
      <span lang={language === 'zh' ? 'zh-CN' : 'en'} className="language-menu-short">{language === 'zh' ? '中文' : 'EN'}</span>
      <Glyph name="chevron" size={16} />
    </Button>
    <Menu ref={menuRef} id={`${id}-menu`} anchor={id} positioning="popover" anchorCorner="end-end" menuCorner="start-end" yOffset={6}
      role="menu" aria-label={label} onOpening={() => setOpen(true)} onClosed={() => setOpen(false)}>
      {(['zh', 'en'] as const).map(value => <MenuItem key={value} type="button" data-selected={language === value}
        aria-label={`${value === 'zh' ? '中文' : 'English'}${language === value ? `, ${currentLabel}` : ''}`}
        onCloseMenu={event => {
          const reason = event.detail.reason;
          if (reason.kind === 'click-selection' || reason.key === 'Enter' || reason.key === 'Space') onChange(value);
        }}>
        <span slot="headline" lang={value === 'zh' ? 'zh-CN' : 'en'}>{value === 'zh' ? '中文' : 'English'}</span>
        <span slot="end" className="language-menu-check">{language === value && <Glyph name="check" size={20} />}</span>
      </MenuItem>)}
    </Menu>
  </div>;
}
