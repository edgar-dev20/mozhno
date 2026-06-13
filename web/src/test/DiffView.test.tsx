import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiffView } from "@/app/components/DiffView";
import type { DiffChange } from "@/shared/diffUtils";

describe('DiffView', () => {
  it('shows empty state when no changes', () => {
    render(<DiffView changes={[]} />);
    expect(screen.getByText('Нет изменений')).toBeInTheDocument();
  });

  it('renders changes with labels', () => {
    const changes: DiffChange[] = [
      { field: 'name', label: 'Name', before: 'Old', after: 'New' },
    ];
    render(<DiffView changes={changes} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Old')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders group headers', () => {
    const changes: DiffChange[] = [
      { field: 'a', label: 'A', before: '1', after: '2', group: 'Settings' },
    ];
    render(<DiffView changes={changes} />);
    expect(screen.getByText(/Settings/)).toBeInTheDocument();
  });

  it('renders multiple groups', () => {
    const changes: DiffChange[] = [
      { field: 'a', label: 'A', before: '1', after: '2', group: 'Group1' },
      { field: 'b', label: 'B', before: '3', after: '4', group: 'Group2' },
    ];
    render(<DiffView changes={changes} />);
    expect(screen.getByText(/Group1/)).toBeInTheDocument();
    expect(screen.getByText(/Group2/)).toBeInTheDocument();
  });

  it('renders removed-only change', () => {
    const changes: DiffChange[] = [
      { field: 'a', label: 'A', before: 'old', after: '' },
    ];
    render(<DiffView changes={changes} />);
    expect(screen.getByText('old')).toBeInTheDocument();
  });

  it('renders added-only change', () => {
    const changes: DiffChange[] = [
      { field: 'a', label: 'A', before: '', after: 'new' },
    ];
    render(<DiffView changes={changes} />);
    expect(screen.getByText('new')).toBeInTheDocument();
  });
});
