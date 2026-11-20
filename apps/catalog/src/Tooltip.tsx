import { cloneElement, useId, useLayoutEffect, useRef, useState, type ReactElement } from 'react';
import './tooltip.css';

// Native popovers escape both the code viewport and a modal's rounded shell.
// They remain non-interactive so touching an action always activates it directly.
export default function Tooltip({ text, children, className = '' }: { text: string; children: ReactElement<{ 'aria-describedby'?: string }>; className?: string }) {
  const id = useId();
  const trigger = useRef<HTMLSpanElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const touch = useRef(false);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const element = tooltip.current!;
    element.setAttribute('popover', 'manual');
    if (!open) return;
    element.showPopover();
    const position = () => {
      const bounds = trigger.current!.getBoundingClientRect();
      const popup = element.getBoundingClientRect();
      const left = Math.max(8, Math.min(bounds.left + (bounds.width - popup.width) / 2, window.innerWidth - popup.width - 8));
      const top = bounds.top - popup.height - 8 >= 8 ? bounds.top - popup.height - 8 : Math.min(bounds.bottom + 8, window.innerHeight - popup.height - 8);
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
    };
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      element.hidePopover();
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [open, text]);

  return <span ref={trigger} className={`action-tooltip ${className}`}
    onPointerEnter={event => { if (event.pointerType !== 'touch') { touch.current = false; setOpen(true); } }}
    onPointerLeave={() => setOpen(false)}
    onPointerDown={event => { touch.current = event.pointerType === 'touch'; if (touch.current) setOpen(false); }}
    onFocusCapture={() => { if (!touch.current) setOpen(true); }}
    onBlurCapture={() => setOpen(false)}
    onKeyDown={event => { touch.current = false; if (event.key === 'Escape' && open) { setOpen(false); event.preventDefault(); event.stopPropagation(); } }}>
    {cloneElement(children, { 'aria-describedby': open ? id : undefined })}
    <div ref={tooltip} id={id} role="tooltip" className="action-tooltip-popup">{text}</div>
  </span>;
}
