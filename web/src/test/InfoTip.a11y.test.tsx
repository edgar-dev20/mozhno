import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { InfoTip } from '@/shared/components/InfoTip';

describe('InfoTip a11y', () => {
  it('has no violations', async () => {
    const { container } = render(<InfoTip text="Additional information about this metric" />);
    await checkA11y(container);
  });

  it('has no violations with custom side and size', async () => {
    const { container } = render(
      <InfoTip text="Help text" side="right" size={14} />,
    );
    await checkA11y(container);
  });
});
