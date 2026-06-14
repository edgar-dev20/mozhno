import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StatusDot } from '@/shared/components/StatusDot';

describe('StatusDot', () => {
  it('renders without errors', () => {
    const { container } = render(<StatusDot state="active" />);
    expect(container.firstElementChild).toBeTruthy();
  });

  it('has rounded-full class for all states', () => {
    const states = ['active', 'recent', 'stale', 'neutral'] as const;
    states.forEach((state) => {
      const { container } = render(<StatusDot state={state} />);
      const dot = container.firstElementChild as HTMLElement;
      expect(dot.className).toContain('rounded-full');
      expect(dot.className).toContain('shrink-0');
    });
  });

  it('applies correct state class', () => {
    const { container } = render(<StatusDot state="active" />);
    const dot = container.firstElementChild as HTMLElement;
    expect(dot.className).toContain('bg-success');
  });

  it('default size is md', () => {
    const { container } = render(<StatusDot state="neutral" />);
    const dot = container.firstElementChild as HTMLElement;
    expect(dot.className).toContain('w-2');
    expect(dot.className).toContain('h-2');
  });

  it('applies sm size when provided', () => {
    const { container } = render(<StatusDot state="active" size="sm" />);
    const dot = container.firstElementChild as HTMLElement;
    expect(dot.className).toContain('w-1.5');
    expect(dot.className).toContain('h-1.5');
  });
});
