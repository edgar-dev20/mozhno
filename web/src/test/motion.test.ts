import { describe, it, expect } from 'vitest';
import { MOTION } from '@/shared/motion';

describe('MOTION', () => {
  it('has expected top-level keys', () => {
    const keys = Object.keys(MOTION);
    expect(keys).toContain('spring');
    expect(keys).toContain('card');
    expect(keys).toContain('scaleIn');
    expect(keys).toContain('accordion');
    expect(keys).toContain('fade');
    expect(keys).toContain('slideUp');
    expect(keys).toContain('dialog');
    expect(keys).toContain('hover');
    expect(keys).toContain('sparkline');
  });

  it('spring is an array of 4 numbers', () => {
    expect(Array.isArray(MOTION.spring)).toBe(true);
    expect(MOTION.spring).toHaveLength(4);
    MOTION.spring.forEach(n => expect(typeof n).toBe('number'));
  });

  it('card has initial, animate, exit, stagger, transition', () => {
    expect(MOTION.card).toHaveProperty('initial');
    expect(MOTION.card).toHaveProperty('animate');
    expect(MOTION.card).toHaveProperty('exit');
    expect(MOTION.card).toHaveProperty('stagger');
    expect(MOTION.card).toHaveProperty('transition');
  });

  it('card.transition is a function that returns { duration, delay, ease }', () => {
    const result = MOTION.card.transition(0);
    expect(result).toHaveProperty('duration');
    expect(result).toHaveProperty('delay');
    expect(result).toHaveProperty('ease');
  });

  it('dialog has overlayIn, overlayOut, contentIn, contentOut', () => {
    expect(MOTION.dialog).toHaveProperty('overlayIn');
    expect(MOTION.dialog).toHaveProperty('overlayOut');
    expect(MOTION.dialog).toHaveProperty('contentIn');
    expect(MOTION.dialog).toHaveProperty('contentOut');
  });
});
