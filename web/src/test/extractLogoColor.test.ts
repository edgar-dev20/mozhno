import { describe, it, expect, vi, afterEach } from 'vitest';
import { extractDominantColor, lightenForDarkMode } from '@/shared/extractLogoColor';

function createTestImage(width = 64, height = 64): HTMLImageElement {
  const img = new Image();
  Object.defineProperty(img, 'naturalWidth', { value: width, configurable: true });
  Object.defineProperty(img, 'naturalHeight', { value: height, configurable: true });
  return img;
}

function createPixelData(
  size: number,
  fill: (i: number) => [r: number, g: number, b: number, a: number],
): Uint8ClampedArray {
  const length = size * size * 4;
  const data = new Uint8ClampedArray(length);
  for (let i = 0; i < size * size; i++) {
    const [r, g, b, a] = fill(i);
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = a;
  }
  return data;
}

function makeImageData(data: Uint8ClampedArray, size = 32): ImageData {
  return { data, width: size, height: size, colorSpace: 'srgb' } as ImageData;
}

function createMockContext(imageData: ImageData): CanvasRenderingContext2D {
  return {
    drawImage: vi.fn(),
    getImageData: vi.fn().mockReturnValue(imageData),
  } as unknown as CanvasRenderingContext2D;
}

function canvasWithContext(ctx: CanvasRenderingContext2D | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  vi.spyOn(canvas, 'getContext').mockReturnValue(ctx);
  return canvas;
}

describe('lightenForDarkMode', () => {
  describe('returns lighter colors for dark shades', () => {
    it('lightens #7c3aed (violet)', () => {
      const result = lightenForDarkMode('#7c3aed');
      expect(result).toBe('#c4a6f7');
    });

    it('lightens #000000 (black) to gray', () => {
      const result = lightenForDarkMode('#000000');
      expect(result).toBe('#8c8c8c');
    });

    it('lightens #0000ff (blue)', () => {
      const result = lightenForDarkMode('#0000ff');
      expect(result).toBe('#8c8cff');
    });

    it('lightens #1a1a2e (dark navy)', () => {
      const result = lightenForDarkMode('#1a1a2e');
      expect(result).toBe('#9898a1');
    });
  });

  describe('keeps light colors near white', () => {
    it('keeps #ffffff (white) unchanged', () => {
      const result = lightenForDarkMode('#ffffff');
      expect(result).toBe('#ffffff');
    });

    it('keeps #f0f0f0 near white', () => {
      const result = lightenForDarkMode('#f0f0f0');
      expect(result).toBe('#f8f8f8');
    });
  });

  describe('output format validation', () => {
    it('starts with #', () => {
      const result = lightenForDarkMode('#7c3aed');
      expect(result.startsWith('#')).toBe(true);
    });

    it('has exactly 7 characters', () => {
      const result = lightenForDarkMode('#7c3aed');
      expect(result).toHaveLength(7);
    });

    it('contains only valid hex characters', () => {
      const result = lightenForDarkMode('#7c3aed');
      expect(result).toMatch(/^#[0-9a-f]{6}$/);
    });

    it('produces valid hex for various inputs', () => {
      const inputs = ['#ff0000', '#00ff00', '#0000ff', '#123456', '#abcdef'];
      for (const input of inputs) {
        const result = lightenForDarkMode(input);
        expect(result).toMatch(/^#[0-9a-f]{6}$/);
        expect(result).toHaveLength(7);
      }
    });

    it('lightened color channels never exceed ff', () => {
      const result = lightenForDarkMode('#ff0000');
      const r = parseInt(result.slice(1, 3), 16);
      const g = parseInt(result.slice(3, 5), 16);
      const b = parseInt(result.slice(5, 7), 16);
      expect(r).toBeLessThanOrEqual(255);
      expect(g).toBeLessThanOrEqual(255);
      expect(b).toBeLessThanOrEqual(255);
    });
  });

  describe('lightening is monotonic', () => {
    it('darker input produces output not lighter than a lighter input', () => {
      const darker = lightenForDarkMode('#333333');
      const lighter = lightenForDarkMode('#cccccc');
      const darkerLum =
        parseInt(darker.slice(1, 3), 16) +
        parseInt(darker.slice(3, 5), 16) +
        parseInt(darker.slice(5, 7), 16);
      const lighterLum =
        parseInt(lighter.slice(1, 3), 16) +
        parseInt(lighter.slice(3, 5), 16) +
        parseInt(lighter.slice(5, 7), 16);
      expect(darkerLum).toBeLessThanOrEqual(lighterLum);
    });
  });
});

describe('extractDominantColor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns fallback #7c3aed when canvas context is null', () => {
    const img = createTestImage();
    const canvas = canvasWithContext(null);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#7c3aed');
  });

  it('returns fallback #7c3aed when no canvas is passed and document.createElement returns null context', () => {
    const img = createTestImage();
    const mockCanvas = document.createElement('canvas');
    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(null);
    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);

    const result = extractDominantColor(img);

    expect(result).toBe('#7c3aed');
  });

  it('returns fallback #7c3aed when an exception occurs', () => {
    const img = createTestImage();
    const failingCtx = {
      drawImage: vi.fn().mockImplementation(() => {
        throw new Error('drawImage failed');
      }),
      getImageData: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    const canvas = canvasWithContext(failingCtx);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#7c3aed');
    expect(failingCtx.drawImage).toHaveBeenCalled();
  });

  it('returns fallback #7c3aed when all pixels are transparent (alpha < 64)', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [255, 0, 0, 10]);
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#7c3aed');
  });

  it('returns fallback #7c3aed when all pixels are grayscale (maxC - minC < 25)', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [128, 128, 128, 255]);
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#7c3aed');
  });

  it('returns fallback #7c3aed when all pixels are too light (minC > 225)', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [230, 255, 230, 255]);
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#7c3aed');
  });

  it('extracts dominant red from pixel data', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [255, 0, 0, 255]);
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#ff0000');
  });

  it('extracts dominant blue from pixel data', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [0, 0, 255, 255]);
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#0000ff');
  });

  it('extracts dominant green from pixel data', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [0, 255, 0, 255]);
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#00ff00');
  });

  it('selects the most frequent color bucket when multiple colors exist', () => {
    const img = createTestImage();
    const size = 32;
    const total = size * size;
    const pixelData = new Uint8ClampedArray(total * 4);
    for (let i = 0; i < total; i++) {
      if (i < 624) {
        pixelData[i * 4] = 0;
        pixelData[i * 4 + 1] = 0;
        pixelData[i * 4 + 2] = 255;
        pixelData[i * 4 + 3] = 255;
      } else {
        pixelData[i * 4] = 255;
        pixelData[i * 4 + 1] = 0;
        pixelData[i * 4 + 2] = 0;
        pixelData[i * 4 + 3] = 255;
      }
    }
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#0000ff');
  });

  it('uses the provided canvas without creating a new one', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [255, 0, 0, 255]);
    const imageData = makeImageData(pixelData);
    const providedCanvas = document.createElement('canvas');
    const ctx = createMockContext(imageData);
    const getContextSpy = vi.spyOn(providedCanvas, 'getContext').mockReturnValue(ctx);
    const createElementSpy = vi.spyOn(document, 'createElement');

    extractDominantColor(img, providedCanvas);

    expect(createElementSpy).not.toHaveBeenCalled();
    expect(getContextSpy).toHaveBeenCalledWith('2d');
    expect(providedCanvas.width).toBe(32);
    expect(providedCanvas.height).toBe(32);
  });

  it('creates a new canvas when none is provided', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [255, 0, 0, 255]);
    const imageData = makeImageData(pixelData);
    const newCanvas = document.createElement('canvas');
    const ctx = createMockContext(imageData);
    vi.spyOn(newCanvas, 'getContext').mockReturnValue(ctx);
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(newCanvas);

    extractDominantColor(img);

    expect(createElementSpy).toHaveBeenCalledWith('canvas');
  });

  it('works correctly with a null canvas argument', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [255, 0, 0, 255]);
    const imageData = makeImageData(pixelData);
    const newCanvas = document.createElement('canvas');
    const ctx = createMockContext(imageData);
    vi.spyOn(newCanvas, 'getContext').mockReturnValue(ctx);
    vi.spyOn(document, 'createElement').mockReturnValue(newCanvas);

    const result = extractDominantColor(img, null);

    expect(result).toBe('#ff0000');
  });

  it('handles images with non-uniform dimensions (tall image)', () => {
    const img = createTestImage(100, 200);
    const pixelData = createPixelData(32, () => [0, 255, 0, 255]);
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(result).toBe('#00ff00');
  });

  it('handles images smaller than the sample size (16x16)', () => {
    const img = createTestImage(16, 16);
    const size = 32;
    const pixelData = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      pixelData[i * 4] = 255;
      pixelData[i * 4 + 1] = 0;
      pixelData[i * 4 + 2] = 255;
      pixelData[i * 4 + 3] = 255;
    }
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(ctx.drawImage).toHaveBeenCalledWith(
      img,
      0, 0, 16, 16,
      0, 0, 32, 32,
    );
    expect(result).toBe('#ff00ff');
  });

  it('draws centered region when image is larger than sample size', () => {
    const img = createTestImage(96, 96);
    const size = 32;
    const pixelData = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      pixelData[i * 4] = 0;
      pixelData[i * 4 + 1] = 255;
      pixelData[i * 4 + 2] = 255;
      pixelData[i * 4 + 3] = 255;
    }
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    extractDominantColor(img, canvas);

    const sx = (96 - 32) / 2;
    const sy = (96 - 32) / 2;
    expect(ctx.drawImage).toHaveBeenCalledWith(
      img,
      sx, sy, 32, 32,
      0, 0, 32, 32,
    );
  });

  it('returns a valid 7-character hex color for successful extractions', () => {
    const img = createTestImage();
    const pixelData = createPixelData(32, () => [200, 100, 50, 255]);
    const imageData = makeImageData(pixelData);
    const ctx = createMockContext(imageData);
    const canvas = canvasWithContext(ctx);

    const result = extractDominantColor(img, canvas);

    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
});
