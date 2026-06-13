import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FlagSparkline } from '@/app/components/FlagSparkline';

describe('FlagSparkline', () => {
  it('renders dash when data is empty', () => {
    const { container } = render(<FlagSparkline data={[]} height={20} />);
    expect(container.querySelector('svg')).toBeNull();
    expect(container.textContent).toContain('—');
  });

  it('renders SVG with bars for provided data', () => {
    const data = [
      { trueCount: 10, falseCount: 3 },
      { trueCount: 20, falseCount: 5 },
      { trueCount: 0, falseCount: 8 },
    ];
    const { container } = render(<FlagSparkline data={data} height={20} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    const rects = svg!.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(2);
  });

  it('renders all bars including zero-count items', () => {
    const data = [
      { trueCount: 10, falseCount: 0 },
      { trueCount: 0, falseCount: 5 },
      { trueCount: 0, falseCount: 0 },
    ];
    const { container } = render(<FlagSparkline data={data} height={20} />);
    const svg = container.querySelector('svg');
    const rects = svg!.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
  });

  it('accepts custom height', () => {
    const data = [{ trueCount: 5, falseCount: 2 }];
    const { container } = render(<FlagSparkline data={data} height={52} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute('height')).toBe('52');
  });

  it('handles large datasets', () => {
    const data = Array.from({ length: 48 }, () => ({
      trueCount: Math.floor(Math.random() * 100),
      falseCount: Math.floor(Math.random() * 30),
    }));
    const { container } = render(<FlagSparkline data={data} height={36} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    const rects = svg!.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
  });
});
