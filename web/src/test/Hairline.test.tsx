import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Hairline } from '@/shared/components/Hairline';

describe('Hairline', () => {
  it('renders a div with border class', () => {
    const { container } = render(<Hairline />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.tagName).toBe('DIV');
    expect(div.className).toContain('border-t');
  });

  it('applies custom className', () => {
    const { container } = render(<Hairline className="my-4" />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain('my-4');
    expect(div.className).toContain('border-t');
  });
});
