import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { Hairline } from '@/shared/components/Hairline';

describe('Hairline a11y', () => {
  it('has no violations', async () => {
    const { container } = render(<Hairline />);
    await checkA11y(container);
  });

  it('has no violations with className', async () => {
    const { container } = render(<Hairline className="my-4" />);
    await checkA11y(container);
  });
});
