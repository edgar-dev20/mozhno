import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GradientButton } from '@/shared/components/GradientButton';

describe('GradientButton', () => {
  it('renders children', () => {
    render(<GradientButton>Click me</GradientButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<GradientButton icon={<span data-testid="ico" />}>Save</GradientButton>);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });

  it('handles click', async () => {
    let clicked = false;
    render(
      <GradientButton
        onClick={() => {
          clicked = true;
        }}
      >
        Click
      </GradientButton>,
    );
    await userEvent.click(screen.getByText('Click'));
    expect(clicked).toBe(true);
  });

  it('is disabled when loading', () => {
    render(<GradientButton loading>Save</GradientButton>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.querySelector('.animate-spin')).toBeTruthy();
  });

  it('is disabled when disabled prop set', () => {
    render(<GradientButton disabled>Save</GradientButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes', () => {
    render(<GradientButton variant="danger">Delete</GradientButton>);
    const btn = screen.getByText('Delete');
    expect(btn.className).toContain('from-red-600');
  });

  it('applies size classes', () => {
    render(<GradientButton size="lg">Big</GradientButton>);
    const btn = screen.getByText('Big');
    expect(btn.className).toContain('px-6');
  });
});
