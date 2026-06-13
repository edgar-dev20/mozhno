import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from "@/shared/components/LoadingState";

describe('LoadingState', () => {
  it('shows default loading text', () => {
    render(<LoadingState />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('shows custom text', () => {
    render(<LoadingState text="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });
});
