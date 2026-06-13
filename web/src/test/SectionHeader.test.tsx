import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from '@/shared/components/SectionHeader';

describe('SectionHeader', () => {
  it('renders title', () => {
    render(<SectionHeader title="Test Title" description="Test description" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('uses default gradient class', () => {
    render(<SectionHeader title="X" description="Y" />);
    const h1 = screen.getByText('X');
    expect(h1.className).toContain('from-gradient-start');
    expect(h1.className).toContain('to-gradient-end');
  });

  it('uses custom gradient class', () => {
    render(<SectionHeader title="X" description="Y" gradientClass="from-red-500 to-blue-500" />);
    const h1 = screen.getByText('X');
    expect(h1.className).toContain('from-red-500');
    expect(h1.className).toContain('to-blue-500');
  });

  it('renders description as ReactNode', () => {
    render(<SectionHeader title="Title" description={<span data-testid="desc">custom</span>} />);
    expect(screen.getByTestId('desc')).toBeInTheDocument();
  });
});
