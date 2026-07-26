import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { WCAG_AA } from '@/test/a11y-helpers';

describe('axe-core integration (negative)', () => {
  it('detects missing alt text on image', async () => {
    const { container } = render(<img src="photo.jpg" />);
    const results = await axe(container, WCAG_AA);
    expect(results.violations.length).toBeGreaterThan(0);
    expect(results.violations.some((v) => v.id === 'image-alt')).toBe(true);
  });

  it('detects empty button with no accessible name', async () => {
    const { container } = render(<button type="button" />);
    const results = await axe(container, WCAG_AA);
    expect(results.violations.length).toBeGreaterThan(0);
  });

  it('detects input without label (WCAG AA)', async () => {
    const { container } = render(
      <div>
        <input type="text" aria-label="" />
      </div>,
    );
    const results = await axe(container, WCAG_AA);
    const violations = results.violations.filter(
      (v) =>
        v.tags.includes('wcag2aa') ||
        v.tags.includes('wcag21aa') ||
        v.tags.includes('cat.forms'),
    );
    expect(violations.length).toBeGreaterThan(0);
  });
});
