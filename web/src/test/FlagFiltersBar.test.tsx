import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlagFiltersBar } from '@/app/components/flags/FlagFiltersBar';

const mockTags = [
  { id: 1, name: 'Priority', color: '#ef4444', projectId: 1, description: '', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Team', color: '#3b82f6', projectId: 1, description: '', createdAt: '2024-01-01T00:00:00Z' },
];

describe('FlagFiltersBar', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    flagTypeFilter: null as string | null,
    onFlagTypeFilterChange: vi.fn(),
    dateFrom: '',
    dateTo: '',
    onDateChange: vi.fn(),
    sortBy: 'name' as const,
    onSortByChange: vi.fn(),
    tags: mockTags,
    selectedTagTypeFilter: null as number | null,
    onTagTypeFilterChange: vi.fn(),
    selectedTagValueFilter: null as string | null,
    onTagValueFilterChange: vi.fn(),
    uniqueTagValues: (_typeId: number) => ['high', 'low'],
  };

  it('renders all filter buttons', () => {
    render(<FlagFiltersBar {...defaultProps} />);
    const allButtons = screen.getAllByText('Все');
    expect(allButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Релиз')).toBeTruthy();
    expect(screen.getByText('Рубильник')).toBeTruthy();
  });

  it('renders sort buttons', () => {
    render(<FlagFiltersBar {...defaultProps} />);
    expect(screen.getByText('По названию')).toBeTruthy();
    expect(screen.getByText('По дате')).toBeTruthy();
  });

  it('renders tag filters when tags exist', () => {
    render(<FlagFiltersBar {...defaultProps} />);
    expect(screen.getByText('Тип тега:')).toBeTruthy();
    expect(screen.getByText('Priority')).toBeTruthy();
    expect(screen.getByText('Team')).toBeTruthy();
  });

  it('shows tag value filter when a tag type is selected', () => {
    render(<FlagFiltersBar {...defaultProps} selectedTagTypeFilter={1} />);
    expect(screen.getByText('Значение:')).toBeTruthy();
  });

  it('does not show tag filters when tags array is empty', () => {
    const { container } = render(<FlagFiltersBar {...defaultProps} tags={[]} />);
    expect(container.querySelector('.space-y-3')).toBeNull();
  });
});
