import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { PageLoader } from '@/shared/components/PageLoader';

describe('PageLoader a11y', () => {
  it('has no violations', async () => {
    const { container } = render(<PageLoader />);
    await checkA11y(container);
  });
});
