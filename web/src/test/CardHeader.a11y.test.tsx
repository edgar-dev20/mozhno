import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { CardHeader } from '@/shared/components/CardHeader';

describe('CardHeader a11y', () => {
  it('has no violations with title only', async () => {
    const { container } = render(<CardHeader title="Test Title" />);
    await checkA11y(container);
  });

  it('has no violations with title and subtitle', async () => {
    const { container } = render(<CardHeader title="Title" subtitle="A subtitle" />);
    await checkA11y(container);
  });

  it('has no violations with meta', async () => {
    const { container } = render(
      <CardHeader title="Title" meta={<span>12 items</span>} />,
    );
    await checkA11y(container);
  });
});
