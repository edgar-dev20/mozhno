function hexToLinearSrgb(hex: string): [number, number, number] {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = ((num >> 16) & 0xff) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;

  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return [toLinear(r), toLinear(g), toLinear(b)];
}

function inGamut(lr: number, lg: number, lb: number): boolean {
  const eps = -1e-8;
  return lr >= eps && lr <= 1 + 1e-8 && lg >= eps && lg <= 1 + 1e-8 && lb >= eps && lb <= 1 + 1e-8;
}

function linearSrgbToHex(lr: number, lg: number, lb: number): string {
  const toGamma = (c: number) => {
    const g = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, g)) * 255);
  };

  const r = toGamma(Math.min(1, Math.max(0, lr)));
  const g = toGamma(Math.min(1, Math.max(0, lg)));
  const b = toGamma(Math.min(1, Math.max(0, lb)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function linearSrgbToOklch(lr: number, lg: number, lb: number): [number, number, number] {
  const lmsL = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const lmsM = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const lmsS = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const lCbrt = Math.cbrt(lmsL);
  const mCbrt = Math.cbrt(lmsM);
  const sCbrt = Math.cbrt(lmsS);

  const L = 0.2104542553 * lCbrt + 0.793617785 * mCbrt - 0.0040720468 * sCbrt;
  const a = 1.9779984951 * lCbrt - 2.428592205 * mCbrt + 0.4505937099 * sCbrt;
  const bVal = 0.0259040371 * lCbrt + 0.7827717662 * mCbrt - 0.808675766 * sCbrt;

  const C = Math.sqrt(a * a + bVal * bVal);
  const H = Math.atan2(bVal, a);

  return [L, C, H];
}

function oklchToLinearSrgb(L: number, C: number, H: number): [number, number, number] {
  const a = C * Math.cos(H);
  const bVal = C * Math.sin(H);

  const lCbrt = L + 0.3963377774 * a + 0.2158037573 * bVal;
  const mCbrt = L - 0.1055613458 * a - 0.0638541728 * bVal;
  const sCbrt = L - 0.0894841775 * a - 1.291485548 * bVal;

  const lmsL = lCbrt * lCbrt * lCbrt;
  const lmsM = mCbrt * mCbrt * mCbrt;
  const lmsS = sCbrt * sCbrt * sCbrt;

  const lr = 4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS;
  const lg = -1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS;
  const lb = -0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.707614701 * lmsS;

  return [lr, lg, lb];
}

function gamutMap(L: number, C: number, H: number): [number, number, number] {
  if (C < 1e-8) return [L, 0, 0];

  let lo = 0;
  let hi = C;

  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const [lr, lg, lb] = oklchToLinearSrgb(L, mid, H);
    if (inGamut(lr, lg, lb)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const bestC = (lo + hi) / 2;
  return [L, bestC, H];
}

export function hexToOklch(hex: string): { L: number; C: number; H: number } | null {
  try {
    const [lr, lg, lb] = hexToLinearSrgb(hex);
    const [L, C, H] = linearSrgbToOklch(lr, lg, lb);
    return { L, C, H };
  } catch {
    return null;
  }
}

export function oklchToHex(L: number, C: number, H: number): string {
  const [lr, lg, lb] = oklchToLinearSrgb(L, C, H);
  return linearSrgbToHex(
    Math.min(1, Math.max(0, lr)),
    Math.min(1, Math.max(0, lg)),
    Math.min(1, Math.max(0, lb)),
  );
}

export function adjustColor(hex: string, amount: number): string {
  const [lr, lg, lb] = hexToLinearSrgb(hex);
  const [L, C, H] = linearSrgbToOklch(lr, lg, lb);
  const deltaL = amount / 255;
  const newL = Math.min(1, Math.max(0, L + deltaL));

  const [fl, fc, fh] = gamutMap(newL, C, H);

  if (fc < 1e-8) {
    return linearSrgbToHex(fl, fl, fl);
  }

  const [nlr, nlg, nlb] = oklchToLinearSrgb(fl, fc, fh);
  return linearSrgbToHex(nlr, nlg, nlb);
}

/**
 * Turns a raw accent color (e.g. a color sampled from a project logo) into a
 * variant that stays legible as title text over the app's `--card` background.
 *
 * The hue is preserved, chroma is tamed so the title never looks neon, and the
 * perceptual lightness (OKLCH L) is clamped into a readable band for the active
 * theme: dark titles on the light surface, light titles on the dark surface.
 */
export function readableAccentColor(hex: string, isDark: boolean): string {
  const oklch = hexToOklch(hex);
  if (!oklch) return hex;

  const L = isDark
    ? Math.min(0.92, Math.max(oklch.L, 0.74))
    : Math.max(0.3, Math.min(oklch.L, 0.55));
  const C = Math.min(oklch.C, 0.16);

  const [gl, gc, gh] = gamutMap(L, C, oklch.H);
  return oklchToHex(gl, gc, gh);
}

export function dimColor(hex: string): string {
  const [lr, lg, lb] = hexToLinearSrgb(hex);
  const [L, C, H] = linearSrgbToOklch(lr, lg, lb);

  const newL = L * 0.85;
  const newC = C * 0.72;

  const [fl, fc, fh] = gamutMap(newL, newC, H);

  if (fc < 1e-8) {
    return linearSrgbToHex(fl, fl, fl);
  }

  const [nlr, nlg, nlb] = oklchToLinearSrgb(fl, fc, fh);
  return linearSrgbToHex(nlr, nlg, nlb);
}

export function readableColorForBg(hex: string): string {
  const oklch = hexToOklch(hex);
  if (!oklch) return '#ffffff';
  return oklch.L > 0.65 ? '#171717' : '#ffffff';
}
