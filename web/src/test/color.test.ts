import { describe, it, expect } from 'vitest';
import { adjustColor, readableAccentColor, hexToOklch } from '@/shared/color';

describe('adjustColor', () => {
  it('lightens a color with positive amount', () => {
    const result = adjustColor('#0000ff', 40);
    expect(result).toBe('#3f77ff');
  });

  it('darkens a color with negative amount', () => {
    const result = adjustColor('#ffffff', -40);
    expect(result).toBe('#cbcbcb');
  });

  it('darkens a near-black color proportionally', () => {
    const result = adjustColor('#0a0a0a', -20);
    expect(result).toBe('#494949');
  });

  it('clamps lightness at 1', () => {
    const result = adjustColor('#f0f0f0', 20);
    expect(result).toBe('#ffffff');
  });

  it('handles colors without hash', () => {
    const result = adjustColor('ff0000', 20);
    expect(result).toBe('#ff6958');
  });
});

describe('readableAccentColor', () => {
  it('returns a valid hex color for both themes', () => {
    expect(readableAccentColor('#1a6b60', false)).toMatch(/^#[0-9a-f]{6}$/);
    expect(readableAccentColor('#1a6b60', true)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('darkens a pale logo color so it stays legible on the light surface', () => {
    const oklch = hexToOklch(readableAccentColor('#e9f5ec', false));
    expect(oklch).not.toBeNull();
    expect(oklch!.L).toBeLessThanOrEqual(0.57);
  });

  it('lightens a dark logo color so it stays legible on the dark surface', () => {
    const oklch = hexToOklch(readableAccentColor('#101820', true));
    expect(oklch).not.toBeNull();
    expect(oklch!.L).toBeGreaterThanOrEqual(0.72);
  });

  it('keeps a mid color inside the light readable band', () => {
    const oklch = hexToOklch(readableAccentColor('#1a6b60', false));
    expect(oklch!.L).toBeGreaterThanOrEqual(0.29);
    expect(oklch!.L).toBeLessThanOrEqual(0.57);
  });

  it('keeps a grayscale logo grayscale', () => {
    const oklch = hexToOklch(readableAccentColor('#808080', true));
    expect(oklch!.C).toBeLessThan(0.02);
  });

  it('preserves the hue family of a saturated input', () => {
    const input = '#2563eb';
    const inHue = hexToOklch(input)!.H;
    const outHue = hexToOklch(readableAccentColor(input, false))!.H;
    expect(Math.abs(outHue - inHue)).toBeLessThan(0.2);
  });
});

