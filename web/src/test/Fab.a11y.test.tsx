import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { Fab } from '@/shared/components/Fab';

describe('Fab a11y', () => {
  it('has no violations', async () => {
    const { container } = render(<Fab onClick={() => {}} label="Create new item" />);
    await checkA11y(container);
  });
});
