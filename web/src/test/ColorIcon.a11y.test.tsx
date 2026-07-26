import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { ColorIcon } from '@/shared/components/ColorIcon';

describe('ColorIcon a11y', () => {
  it('has no violations as non-interactive', async () => {
    const { container } = render(
      <ColorIcon color="#3b82f6" icon={<span aria-hidden="true">?</span>} />,
    );
    await checkA11y(container);
  });

  it('has no violations as interactive button', async () => {
    const { container } = render(
      <ColorIcon
        color="#3b82f6"
        icon={<span aria-hidden="true">+</span>}
        onClick={() => {}}
        aria-label="Add color"
      />,
    );
    await checkA11y(container);
  });

  it('has no violations in gradient variant', async () => {
    const { container } = render(
      <ColorIcon
        variant="gradient"
        size="lg"
        color="#3b82f6"
        icon={<span aria-hidden="true">G</span>}
      />,
    );
    await checkA11y(container);
  });

  it('has no violations in ghost variant', async () => {
    const { container } = render(
      <ColorIcon
        variant="ghost"
        color="#3b82f6"
        icon={<span aria-hidden="true">H</span>}
      />,
    );
    await checkA11y(container);
  });
});
