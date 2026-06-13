import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ColorBar } from '@/shared/components/ColorBar';

describe('ColorBar', () => {
  it('renders with given color', () => {
    const { container } = render(<ColorBar color="#ff0000" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('h-1.5');
    expect(div.style.background).toContain('rgb(255, 0, 0)');
  });

  it('renders gradient background', () => {
    const { container } = render(<ColorBar color="#00ff00" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.background).toContain('linear-gradient');
  });
});
