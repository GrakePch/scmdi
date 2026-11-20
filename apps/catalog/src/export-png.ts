import { svgMarkup } from './library.mjs';

export interface PngOptions {
  path: string;
  color: string;
  size: number;
}

export async function createPngBlob({ path, color, size }: PngOptions): Promise<Blob> {
  if (!Number.isInteger(size) || size < 1 || size > 4096) {
    throw new Error('PNG size must be an integer between 1 and 4096 pixels.');
  }
  if (!CSS.supports('color', color) || /^(currentcolor|inherit|initial|unset|revert)$/i.test(color.trim()) || /var\(/i.test(color)) {
    throw new Error('PNG export requires a resolved CSS color.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create a canvas for PNG export.');

  const safeColor = color.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);
  const svg = svgMarkup(path)
    .replace('width="24" height="24"', `width="${size}" height="${size}"`)
    .replace('fill="currentColor"', `fill="${safeColor}"`);
  const sourceUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Could not load the SVG for PNG export.'));
      image.src = sourceUrl;
    });
    try { await image.decode(); }
    catch { throw new Error('Could not decode the SVG for PNG export.'); }
    context.drawImage(image, 0, 0, size, size);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode the PNG image.')), 'image/png');
    });
  } finally {
    image.onload = image.onerror = null;
    image.src = '';
    URL.revokeObjectURL(sourceUrl);
  }
}

export async function downloadPng({ name, ...options }: PngOptions & { name: string }): Promise<void> {
  const blob = await createPngBlob(options);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}.png`;
  anchor.hidden = true;
  let clicked = false;
  try {
    document.body.append(anchor);
    anchor.click();
    clicked = true;
  } finally {
    anchor.remove();
    // Keep the URL alive until the browser has accepted the download task.
    if (clicked) window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    else URL.revokeObjectURL(url);
  }
}
