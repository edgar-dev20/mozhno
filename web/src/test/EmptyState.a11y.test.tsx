import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { EmptyState } from '@/shared/components/EmptyState';

describe('EmptyState a11y', () => {
  it('has no violations with icon', async () => {
    const { container } = render(
      <EmptyState
        icon={<span aria-hidden="true">E</span>}
        title="No items"
        description="Nothing here yet"
      />,
    );
    await checkA11y(container);
  });

  it('has no violations with action button', async () => {
    const { container } = render(
      <EmptyState
        icon={<span aria-hidden="true">E</span>}
        title="No items"
        description="Create one now"
        buttonLabel="Create"
        onAction={() => {}}
      />,
    );
    await checkA11y(container);
  });

  it('has no violations with illustration', async () => {
    const { container } = render(
      <EmptyState
        illustration={<span aria-hidden="true">+</span>}
        title="Empty"
        description="Start by adding data"
      />,
    );
    await checkA11y(container);
  });
});
