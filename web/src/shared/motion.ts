let durNormal = 0.2;
let durSlow = 0.3;
let durFast = 0.15;
let easeOutVal = 'easeOut' as const;
let easeInOutVal = 'easeInOut' as const;
let initialized = false;

function readTokens() {
  if (initialized) return;
  if (typeof document === 'undefined') return;
  const style = getComputedStyle(document.documentElement);
  const dN = parseFloat(style.getPropertyValue('--duration-normal'));
  const dS = parseFloat(style.getPropertyValue('--duration-slow'));
  const dF = parseFloat(style.getPropertyValue('--duration-fast'));
  if (!isNaN(dN)) durNormal = dN / 1000;
  if (!isNaN(dS)) durSlow = dS / 1000;
  if (!isNaN(dF)) durFast = dF / 1000;
  const eOut = style.getPropertyValue('--ease-out');
  const eIO = style.getPropertyValue('--ease-in-out');
  if (eOut && eOut !== 'cubic-bezier(0, 0, 0.2, 1)') {
    easeOutVal = eOut as typeof easeOutVal;
  }
  if (eIO && eIO !== 'cubic-bezier(0.4, 0, 0.2, 1)') {
    easeInOutVal = eIO as typeof easeInOutVal;
  }
  initialized = true;
}

function normal() {
  readTokens();
  return durNormal;
}

function slow() {
  readTokens();
  return durSlow;
}

function fast() {
  readTokens();
  return durFast;
}

function easeOut() {
  readTokens();
  return easeOutVal;
}

function easeInOut() {
  readTokens();
  return easeInOutVal;
}

export const spring = [300, 30, 0, 1] as const;

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

export const accordion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  get transition() {
    return { duration: slow(), ease: easeInOut() };
  },
};

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export const card = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20 },
  stagger: 0.05,
  transition: (i: number) => ({
    duration: normal(),
    delay: i * 0.05,
    ease: easeOut(),
  }),
};

export const dialog = {
  overlayIn: { opacity: 0 },
  overlayOut: { opacity: 1 },
  contentIn: { opacity: 0, scale: 0.95, y: 20 },
  contentOut: { opacity: 1, scale: 1, y: 0 },
};

export const hover = {
  scale: 1.02,
  get transition() {
    return { duration: fast() };
  },
};

export const sparkline = {
  initial: { pathLength: 0 },
  animate: { pathLength: 1 },
};

export const MOTION = {
  spring,
  card,
  scaleIn,
  accordion,
  fade,
  slideUp,
  dialog,
  hover,
  sparkline,
};
