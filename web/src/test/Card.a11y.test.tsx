import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { Card } from '@/shared/components/Card';

describe('Card a11y', () => {
  it('has no violations as div', async () => {
    const { container } = render(
      <Card padded>
        <p>Card content</p>
      </Card>,
    );
    await checkA11y(container);
  });

  it('has no violations as interactive button', async () => {
    const { container } = render(
      <Card padded onClick={() => {}} ariaLabel="Select project">
        <p>Clickable card</p>
      </Card>,
    );
    await checkA11y(container);
  });

  it('has no violations in selectable variant', async () => {
    const { container } = render(
      <Card variant="selectable" selected>
        <p>Selected card</p>
      </Card>,
    );
    await checkA11y(container);
  });

  it('has no violations in elevated variant', async () => {
    const { container } = render(
      <Card variant="elevated">
        <p>Elevated card</p>
      </Card>,
    );
    await checkA11y(container);
  });

  it('has no violations with dimmed state', async () => {
    const { container } = render(
      <Card dimmed padded>
        <p>Dimmed card</p>
      </Card>,
    );
    await checkA11y(container);
  });
});
