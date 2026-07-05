export function extractDominantColor(
  img: HTMLImageElement,
  canvas?: HTMLCanvasElement | null,
): string {
  try {
    const c = canvas ?? document.createElement('canvas');
    const size = 32;
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (!ctx) return '#1a6b60';

    const sx = Math.max(0, (img.naturalWidth - size) / 2);
    const sy = Math.max(0, (img.naturalHeight - size) / 2);
    const sw = Math.min(size, img.naturalWidth);
    const sh = Math.min(size, img.naturalHeight);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    const buckets = new Map<number, number>();
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 64) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const minC = Math.min(r, g, b);
      const maxC = Math.max(r, g, b);
      if (maxC - minC < 25) continue;
      if (minC > 225) continue;
      const qr = r >> 3;
      const qg = g >> 3;
      const qb = b >> 3;
      const key = (qr << 10) | (qg << 5) | qb;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    if (buckets.size === 0) return '#1a6b60';

    let bestKey = 0;
    let bestCount = 0;
    for (const [key, count] of buckets) {
      if (count > bestCount) {
        bestCount = count;
        bestKey = key;
      }
    }

    const qr = (bestKey >> 10) & 0x1f;
    const qg = (bestKey >> 5) & 0x1f;
    const qb = bestKey & 0x1f;
    const r = (qr << 3) | (qr >> 2);
    const g = (qg << 3) | (qg >> 2);
    const b = (qb << 3) | (qb >> 2);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch {
    return '#1a6b60';
  }
}
