import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { TruncatedCopyTooltip } from '@/shared/components/TruncatedCopyTooltip';

describe('TruncatedCopyTooltip a11y', () => {
  it('has no violations', async () => {
    const { container } = render(
      <TruncatedCopyTooltip value="api-key-1234567890abcdef" />,
    );
    await checkA11y(container);
  });

  it('has no violations with className', async () => {
    const { container } = render(
      <TruncatedCopyTooltip value="short" className="custom-code" />,
    );
    await checkA11y(container);
  });
});
