import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { checkA11y } from '@/test/a11y-helpers';
import { LazyPage } from '@/shared/components/LazyPage';

const DummyComponent = React.lazy(
  () =>
    Promise.resolve({
      default: () => <div>Loaded content</div>,
    }),
);

describe('LazyPage a11y', () => {
  it('has no violations after loading', async () => {
    const { container } = render(<LazyPage Component={DummyComponent} />);
    await waitFor(() => {
      expect(container.textContent).toContain('Loaded content');
    });
    await checkA11y(container);
  });
});
