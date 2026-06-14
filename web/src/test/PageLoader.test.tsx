import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageLoader } from '@/shared/components/PageLoader';

describe('PageLoader', () => {
  it('renders Loading... text', () => {
    render(<PageLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    const { container } = render(<PageLoader />);
    expect(container.firstElementChild).toBeTruthy();
  });
});
