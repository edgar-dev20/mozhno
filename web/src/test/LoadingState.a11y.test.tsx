import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { LoadingState } from '@/shared/components/LoadingState';

describe('LoadingState a11y', () => {
  it('has no violations with default text', async () => {
    const { container } = render(<LoadingState />);
    await checkA11y(container);
  });

  it('has no violations with custom text', async () => {
    const { container } = render(<LoadingState text="Please wait..." />);
    await checkA11y(container);
  });
});
