import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { ColorBar } from '@/shared/components/ColorBar';

describe('ColorBar a11y', () => {
  it('has no violations', async () => {
    const { container } = render(<ColorBar color="#ff0000" />);
    await checkA11y(container);
  });

  it('has no violations with label', async () => {
    const { container } = render(<ColorBar color="#00ff00" label="Production" />);
    await checkA11y(container);
  });
});
