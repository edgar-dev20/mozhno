import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { GradientButton } from '@/shared/components/GradientButton';

describe('GradientButton a11y', () => {
  it('has no violations in default state', async () => {
    const { container } = render(<GradientButton>Click me</GradientButton>);
    await checkA11y(container);
  });

  it('has no violations with icon', async () => {
    const { container } = render(
      <GradientButton icon={<span aria-hidden="true">+</span>}>Save</GradientButton>,
    );
    await checkA11y(container);
  });

  it('has no violations in danger variant', async () => {
    const { container } = render(<GradientButton variant="danger">Delete</GradientButton>);
    await checkA11y(container);
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<GradientButton disabled>Disabled</GradientButton>);
    await checkA11y(container);
  });

  it('has no violations when loading', async () => {
    const { container } = render(<GradientButton loading>Loading</GradientButton>);
    await checkA11y(container);
  });

  it('has no violations in secondary variant', async () => {
    const { container } = render(
      <GradientButton variant="secondary">Cancel</GradientButton>,
    );
    await checkA11y(container);
  });

  it('has no violations in ghost variant', async () => {
    const { container } = render(<GradientButton variant="ghost">Dismiss</GradientButton>);
    await checkA11y(container);
  });
});
