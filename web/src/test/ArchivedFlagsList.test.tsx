import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArchivedFlagsList } from "@/app/components/flags/ArchivedFlagsList";

const mockTags = [
  { id: 1, name: 'Priority', color: '#ef4444', projectId: 1 },
];

const makeFlag = (overrides: Record<string, unknown> = {}) => ({
  key: 'test-flag',
  name: 'Test Flag',
  description: 'A test flag',
  flagType: 'RELEASE',
  tags: [{ tagId: 1, tagName: 'Priority', tagColor: '#ef4444', value: 'high' }],
  flagId: 1,
  environments: {},
  archived: true,
  createdAt: '2024-01-15T10:30:00Z',
  createdBy: 'user@test.com',
  archivedBy: 'admin@test.com',
  archivedAt: '2024-06-01T10:30:00Z',
  ...overrides,
});

describe('ArchivedFlagsList', () => {
  it('renders nothing when flags array is empty', () => {
    const { container } = render(
      <ArchivedFlagsList flags={[]} onUnarchive={vi.fn()} tags={mockTags} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders archived flags with details', () => {
    const flag = makeFlag();
    render(
      <ArchivedFlagsList flags={[flag]} onUnarchive={vi.fn()} tags={mockTags} />
    );

    expect(screen.getByText('Архивные флаги')).toBeTruthy();
    expect(screen.getByText('Test Flag')).toBeTruthy();
    expect(screen.getByText('test-flag')).toBeTruthy();
    expect(screen.getByText('Релиз')).toBeTruthy();
    expect(screen.getByText('user@test.com')).toBeTruthy();
    expect(screen.getByText('Восстановить')).toBeTruthy();
  });

  it('renders multiple archived flags', () => {
    const flags = [
      makeFlag({ key: 'flag-1', name: 'Flag 1', flagId: 1 }),
      makeFlag({ key: 'flag-2', name: 'Flag 2', flagId: 2 }),
    ];
    render(
      <ArchivedFlagsList flags={flags} onUnarchive={vi.fn()} tags={mockTags} />
    );

    expect(screen.getByText('Flag 1')).toBeTruthy();
    expect(screen.getByText('Flag 2')).toBeTruthy();
  });

  it('calls onUnarchive when restore button is clicked', () => {
    const onUnarchive = vi.fn();
    const flag = makeFlag();
    render(
      <ArchivedFlagsList flags={[flag]} onUnarchive={onUnarchive} tags={mockTags} />
    );

    const restoreBtn = screen.getByText('Восстановить');
    restoreBtn.click();
    expect(onUnarchive).toHaveBeenCalledWith(flag);
  });
});
