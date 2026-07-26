import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { SkipLink } from '@/shared/components/SkipLink';

describe('SkipLink', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<SkipLink />);
    await checkA11y(container);
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
