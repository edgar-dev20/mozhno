import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardHeader } from '@/shared/components/CardHeader';

describe('CardHeader', () => {
  it('renders title', () => {
    render(<CardHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<CardHeader title="Title" subtitle="A subtitle" />);
    expect(screen.getByText('A subtitle')).toBeInTheDocument();
  });

  it('does NOT render subtitle section when not provided', () => {
    const { container } = render(<CardHeader title="Title" />);
    const p = container.querySelector('p');
    expect(p).toBeNull();
  });

  it('renders meta when provided', () => {
    render(<CardHeader title="Title" meta={<span data-testid="meta">Meta content</span>} />);
    expect(screen.getByTestId('meta')).toBeInTheDocument();
  });

  it('does NOT render meta when not provided', () => {
    const { container } = render(<CardHeader title="Title" />);
    const span = container.querySelector('span');
    expect(span).toBeNull();
  });

  it('applies className', () => {
    const { container } = render(<CardHeader title="Title" className="custom-class" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('custom-class');
  });
});
