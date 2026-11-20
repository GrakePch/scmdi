import { useMemo, type CSSProperties, type Ref } from 'react';
import Icon from '@mdi/react';
import './icon-preview.css';

interface IconPreviewProps {
  path: string;
  size: number;
  color: string | null;
  elementRef?: Ref<HTMLDivElement>;
}

export default function IconPreview({ path, size, color, elementRef }: IconPreviewProps) {
  const tone = useMemo(() => {
    if (!color) return undefined;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return undefined;
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
    const linear = [red, green, blue].map(channel => {
      const value = channel / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    });
    const luminance = .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
    return luminance > .6 ? 'light' : luminance < .035 ? 'dark' : undefined;
  }, [color]);
  const style = color ? { '--preview-selected-color': color } as CSSProperties : undefined;
  return <div ref={elementRef} className="detail-preview icon-preview" data-custom-color={color ? 'true' : undefined} data-color-tone={tone} style={style}>
    <Icon path={path} size={`${size}px`} aria-hidden="true" />
  </div>;
}
