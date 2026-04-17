import { describe, it, expect } from 'vitest';
import { adjustColor } from "@/shared/color";

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
