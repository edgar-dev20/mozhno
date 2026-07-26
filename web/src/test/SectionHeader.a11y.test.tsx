import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { SectionHeader } from '@/shared/components/SectionHeader';

describe('SectionHeader a11y', () => {
  it('has no violations with string description', async () => {
    const { container } = render(
      <SectionHeader title="Test Title" description="Test description" />,
    );
    await checkA11y(container);
  });

  it('has no violations with ReactNode description', async () => {
    const { container } = render(
      <SectionHeader title="Title" description={<span>Custom description</span>} />,
    );
    await checkA11y(container);
  });

  it('has no violations with custom gradient', async () => {
    const { container } = render(
      <SectionHeader
        title="Custom"
        description="Description"
        gradientClass="from-destructive to-info"
      />,
    );
    await checkA11y(container);
  });
});
