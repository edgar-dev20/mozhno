import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBox } from '@/shared/components/ErrorBox';

describe('ErrorBox', () => {
  it('renders children text', () => {
    render(<ErrorBox>Something went wrong</ErrorBox>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has destructive styling classes', () => {
    const { container } = render(<ErrorBox>Error message</ErrorBox>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('bg-destructive/10');
    expect(root.className).toContain('border-destructive/20');
    expect(root.className).toContain('text-destructive');
  });

  it('applies custom className', () => {
    const { container } = render(<ErrorBox className="my-error">Error</ErrorBox>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('my-error');
  });
});
