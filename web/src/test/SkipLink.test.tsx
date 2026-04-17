import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SkipLink } from '@/shared/components/SkipLink';

describe('SkipLink', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<SkipLink />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('links to main-content', () => {
    render(<SkipLink />);
    const link = document.querySelector('a[href="#main-content"]');
    expect(link).toBeTruthy();
  });

  it('has sr-only class for visual hiding', () => {
    render(<SkipLink />);
    const link = document.querySelector('a[href="#main-content"]');
    expect(link?.className).toContain('sr-only');
  });
});
