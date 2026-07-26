import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { StatusDot } from '@/shared/components/StatusDot';

describe('StatusDot a11y', () => {
  it('has no violations', async () => {
    const { container } = render(<StatusDot state="active" />);
    await checkA11y(container);
  });

  it('has no violations with label', async () => {
    const { container } = render(<StatusDot state="active" label="Active" />);
    await checkA11y(container);
  });

  it('has no violations in neutral state', async () => {
    const { container } = render(<StatusDot state="neutral" />);
    await checkA11y(container);
  });
});
