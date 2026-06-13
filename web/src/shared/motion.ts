export const spring = [300, 30, 0, 1] as const;

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
};

export const accordion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.25, ease: 'easeInOut' as const },
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
    duration: 0.2,
    delay: i * 0.05,
    ease: 'easeOut' as const,
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
  transition: { duration: 0.2 },
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
