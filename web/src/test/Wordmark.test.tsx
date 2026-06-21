import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Wordmark } from '@/shared/components/Wordmark';

describe('Wordmark', () => {
  it('renders the text prop', () => {
    render(<Wordmark text="Mozhno" />);
    expect(screen.getByText('Mozhno')).toBeInTheDocument();
  });

  it('renders a dot character after text', () => {
    render(<Wordmark text="Mozhno" />);
    expect(screen.getByText('.')).toBeInTheDocument();
  });

  it('has gradient on text and copper period', () => {
    const { container } = render(<Wordmark text="Test" />);
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBeGreaterThanOrEqual(2);
    expect(spans[0].className).toContain('from-gradient-start');
    expect(spans[0].className).toContain('to-gradient-end');
    expect(spans[1].style.color).toBe('rgb(184, 104, 64)');
  });

  it('default size is lg', () => {
    const { container } = render(<Wordmark text="Test" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('text-3xl');
  });

  it('applies custom size and className', () => {
    const { container } = render(<Wordmark text="Test" size="xl" className="custom" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('text-4xl');
    expect(root.className).toContain('custom');
  });
});
