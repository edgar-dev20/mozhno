import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { Wordmark } from '@/shared/components/Wordmark';

describe('Wordmark a11y', () => {
  it('has no violations', async () => {
    const { container } = render(<Wordmark text="Mozhno" />);
    await checkA11y(container);
  });

  it('has no violations with custom size', async () => {
    const { container } = render(<Wordmark text="Test" size="xl" />);
    await checkA11y(container);
  });

  it('has no violations with className', async () => {
    const { container } = render(<Wordmark text="Custom" className="extra" />);
    await checkA11y(container);
  });
});
