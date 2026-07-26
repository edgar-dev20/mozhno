import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { ColorPicker } from '@/shared/components/ColorPicker';

describe('ColorPicker a11y', () => {
  it('has no violations with default value', async () => {
    const { container } = render(
      <ColorPicker value="#3b82f6" onChange={() => {}} />,
    );
    await checkA11y(container);
  });

  it('has no violations with preview name', async () => {
    const { container } = render(
      <ColorPicker
        value="#ef4444"
        onChange={() => {}}
        previewName="Production"
        previewPlaceholder="Select environment"
      />,
    );
    await checkA11y(container);
  });

  it('has no violations with icon', async () => {
    const { container } = render(
      <ColorPicker
        value="#22c55e"
        onChange={() => {}}
        icon={<span aria-hidden="true">*</span>}
      />,
    );
    await checkA11y(container);
  });
});
