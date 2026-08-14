import { useState, useMemo } from 'react';
import type { FlagView } from '@/app/hooks/flagTypes';

interface FilterCriteria {
  selectedTagTypeFilter: number | null;
  selectedTagValueFilter: string | null;
  flagTypeFilter: string | null;
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'name' | 'createdAt';
  staleFilter: boolean;
}

const STALE_MS = 30 * 24 * 60 * 60 * 1000;

function applyFilters(flags: FlagView[], criteria: FilterCriteria, archived: boolean): FlagView[] {
  let result = flags.filter((f) => (f.archived ?? false) === archived);

  const {
    selectedTagTypeFilter,
    selectedTagValueFilter,
    flagTypeFilter,
    searchQuery,
    dateFrom,
    dateTo,
    sortBy,
    staleFilter,
  } = criteria;

  if (staleFilter) {
    const now = Date.now();
    result = result.filter((f) => {
      const envs = Object.values(f.environments);
      if (envs.length === 0) return true;
      return envs.every((e) => {
        if (!e.lastUsedAt) return true;
        return now - new Date(e.lastUsedAt).getTime() > STALE_MS;
      });
    });
  }

  if (selectedTagTypeFilter) {
    result = result.filter((f) =>
      f.tags.some(
        (tg) =>
          tg.tagId === selectedTagTypeFilter &&
          (!selectedTagValueFilter || tg.value === selectedTagValueFilter),
      ),
    );
  }

  if (flagTypeFilter) {
    result = result.filter((f) => f.flagType === flagTypeFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q) ||
        (f.createdBy ?? '').toLowerCase().includes(q),
    );
  }

  if (dateFrom || dateTo) {
    result = result.filter((f) => {
      if (!f.createdAt) return !dateFrom && !dateTo;
      const d = f.createdAt.slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }

  result = [...result].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
  });

  return result;
}

export function useFlagFilters(flags: FlagView[], totalItems?: number) {
  const [selectedTagTypeFilter, setSelectedTagTypeFilter] = useState<number | null>(null);
  const [selectedTagValueFilter, setSelectedTagValueFilter] = useState<string | null>(null);
  const [flagTypeFilter, setFlagTypeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('name');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [staleFilter, setStaleFilter] = useState(false);

  const criteria: FilterCriteria = useMemo(
    () => ({
      selectedTagTypeFilter,
      selectedTagValueFilter,
      flagTypeFilter,
      searchQuery,
      dateFrom,
      dateTo,
      sortBy,
      staleFilter,
    }),
    [
      selectedTagTypeFilter,
      selectedTagValueFilter,
      flagTypeFilter,
      searchQuery,
      dateFrom,
      dateTo,
      sortBy,
      staleFilter,
    ],
  );

  const filtered = useMemo(
    () => applyFilters(flags, criteria, false),
    [flags, criteria],
  );

  const archivedFlags = useMemo(
    () => applyFilters(flags, criteria, true),
    [flags, criteria],
  );

  const visibleFlags = filtered.slice(0, displayLimit);
  const hasMoreFlags = displayLimit < filtered.length;

  const showMoreFlags = () => setDisplayLimit((prev) => Math.min(prev + 10, filtered.length));
  const showAllFlags = () => setDisplayLimit(filtered.length);

  const clearFilters = () => {
    setSearchQuery('');
    setFlagTypeFilter(null);
    setSelectedTagTypeFilter(null);
    setSelectedTagValueFilter(null);
    setDateFrom('');
    setDateTo('');
    setStaleFilter(false);
  };

  const uniqueTagValues = (typeId: number) =>
    [
      ...new Set(
        flags.flatMap((f) => f.tags.filter((t) => t.tagId === typeId).map((t) => t.value)),
      ),
    ].sort();

  return {
    filtered,
    archivedFlags,
    visibleFlags,
    hasMoreFlags,
    showMoreFlags,
    showAllFlags,
    displayLimit,
    selectedTagTypeFilter,
    setSelectedTagTypeFilter,
    selectedTagValueFilter,
    setSelectedTagValueFilter,
    flagTypeFilter,
    setFlagTypeFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    uniqueTagValues,
    totalItems,
    staleFilter,
    setStaleFilter,
    clearFilters,
  };
}
