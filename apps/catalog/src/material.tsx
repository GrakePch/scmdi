import React, { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Icon from '@mdi/react';
import { mdiMagnify, mdiContentCopy, mdiDownload, mdiCheck, mdiClose, mdiWhiteBalanceSunny, mdiWeatherNight, mdiLinkVariant, mdiPlus, mdiOpenInNew, mdiChevronDown, mdiGithub, mdiViewGrid, mdiViewModule, mdiViewComfy } from '@mdi/js';
import { createComponent, type EventName } from '@lit/react';
import { MdIconButton } from '@material/web/iconbutton/icon-button.js';
import { MdRipple } from '@material/web/ripple/ripple.js';
import { MdSlider } from '@material/web/slider/slider.js';
import { MdTabs } from '@material/web/tabs/tabs.js';
import { MdPrimaryTab } from '@material/web/tabs/primary-tab.js';
import { buttonClasses, setupButton, type ButtonColor, type ButtonSize } from '@material/web/labs/gb/components/button/button.js';
import '@material/web/labs/gb/styles/shape/md-shape-tokens.css';
import '@material/web/labs/gb/styles/typography/md-typography-tokens.css';
import '@material/web/labs/gb/components/focus/focus-ring.css';
import '@material/web/labs/gb/components/ripple/ripple.css';
import '@material/web/labs/gb/components/button/button.css';

export const IconButton = createComponent({ react: React, tagName: 'md-icon-button', elementClass: MdIconButton });
export const MaterialRipple = createComponent({ react: React, tagName: 'md-ripple', elementClass: MdRipple });
export const MaterialSlider = createComponent({ react: React, tagName: 'md-slider', elementClass: MdSlider, events: { onInput: 'input' as EventName<Event> } });
export const MaterialTabs = createComponent({ react: React, tagName: 'md-tabs', elementClass: MdTabs, events: { onChange: 'change' as EventName<Event> } });
export const MaterialTab = createComponent({ react: React, tagName: 'md-primary-tab', elementClass: MdPrimaryTab });

// Keep the experimental Expressive utility API in one adapter for upgrades.
export function Button({ color = 'text', size = 'sm', className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { color?: ButtonColor; size?: ButtonSize }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    if (ref.current) setupButton(ref.current, { signal: controller.signal });
    return () => controller.abort();
  }, []);
  const classes = Object.entries(buttonClasses({ color, size })).filter(([, enabled]) => enabled).map(([name]) => name).join(' ');
  return <button {...props} ref={ref} type={type} className={`${classes} material-button ${className}`} />;
}

const glyphPaths = {
  search: mdiMagnify,
  copy: mdiContentCopy,
  download: mdiDownload,
  check: mdiCheck,
  close: mdiClose,
  sun: mdiWhiteBalanceSunny,
  moon: mdiWeatherNight,
  link: mdiLinkVariant,
  plus: mdiPlus,
  external: mdiOpenInNew,
  chevron: mdiChevronDown,
  github: mdiGithub,
  gridLarge: mdiViewGrid,
  gridMedium: mdiViewModule,
  gridCompact: mdiViewComfy,
};

export function Glyph({ name, size = 24 }: { name: keyof typeof glyphPaths; size?: number }) {
  return <Icon path={glyphPaths[name]} size={`${size}px`} aria-hidden="true" />;
}

// The surface owns its shape; only the inset viewport scrolls. The header stays
// available even in short windows, and native keyboard/touch scrolling is kept.
export function ScrollSurface({ header, children }: { header: ReactNode; children: ReactNode }) {
  return <>
    <div className="surface-header">{header}</div>
    <div className="surface-scroll" tabIndex={0}><div className="surface-content">{children}</div></div>
  </>;
}

export function Modal({ children, className = '', labelledBy, label, onClose }: { children: ReactNode; className?: string; labelledBy?: string; label?: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previousOverflow = document.body.style.overflow;
    const closeControl = dialog.querySelector<HTMLElement & { updateComplete?: Promise<unknown> }>('[data-dialog-close]');
    closeControl?.setAttribute('autofocus', '');
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    void Promise.resolve(closeControl?.updateComplete).then(() => {
      if (dialog.open) closeControl?.focus({ preventScroll: true });
    });
    return () => { document.body.style.overflow = previousOverflow; dialog.close(); };
  }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : label} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}>{children}</dialog>;
}
