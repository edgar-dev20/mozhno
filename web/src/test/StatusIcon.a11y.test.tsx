import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { StatusIcon } from '@/shared/components/StatusIcon';

describe('StatusIcon a11y', () => {
  it('has no violations in sm size', async () => {
    const { container } = render(
      <StatusIcon variant="success" icon={<span aria-hidden="true">S</span>} size="sm" />,
    );
    await checkA11y(container);
  });

  it('has no violations in md size', async () => {
    const { container } = render(
      <StatusIcon variant="brand" icon={<span aria-hidden="true">B</span>} size="md" />,
    );
    await checkA11y(container);
  });

  it('has no violations with destructive variant', async () => {
    const { container } = render(
      <StatusIcon variant="destructive" icon={<span aria-hidden="true">D</span>} />,
    );
    await checkA11y(container);
  });

  it('has no violations with warning variant', async () => {
    const { container } = render(
      <StatusIcon variant="warning" icon={<span aria-hidden="true">W</span>} />,
    );
    await checkA11y(container);
  });

  it('has no violations with info variant', async () => {
    const { container } = render(
      <StatusIcon variant="info" icon={<span aria-hidden="true">I</span>} />,
    );
    await checkA11y(container);
  });
});
