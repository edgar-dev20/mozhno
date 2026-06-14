export const MOTION = {
  spring: [0.16, 1, 0.3, 1] as const,

  card: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20 },
    stagger: 0.03,
    transition: (idx: number) => ({ duration: 0.2, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] as const }),
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    stagger: 0.03,
    transition: (idx: number) => ({ duration: 0.2, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] as const }),
  },

  accordion: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.25, ease: 'easeInOut' as const },
  },

  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },

  dialog: {
    overlayIn: { duration: 0.3, ease: 'easeOut' as const },
    overlayOut: { duration: 0.2, ease: 'easeIn' as const },
    contentIn: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
    contentOut: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },

  hover: { duration: 0.15, ease: 'easeOut' as const },

  sparkline: {
    clipReveal: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
    bar: (i: number, offset = 0) => ({ delay: i * 0.02 + offset, duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }),
  },
} as const;
