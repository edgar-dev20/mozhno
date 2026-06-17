import { useState, useEffect, useMemo } from 'react';
import { FlagView } from '@/app/hooks/flagTypes';

export function useFlagFilters(flags: FlagView[], totalItems?: number) {
  const [selectedTagTypeFilter, setSelectedTagTypeFilter] = useState<number | null>(null);
  const [selectedTagValueFilter, setSelectedTagValueFilter] = useState<string | null>(null);
  const [flagTypeFilter, setFlagTypeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('name');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);

  useEffect(() => {
    setDisplayLimit(10);
  }, [
    searchQuery,
    selectedTagTypeFilter,
    selectedTagValueFilter,
    dateFrom,
    dateTo,
    sortBy,
    flagTypeFilter,
  ]);

  const filtered = useMemo(() => {
    let result = flags.filter((f) => !f.archived);

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
  }, [
    flags,
    selectedTagTypeFilter,
    selectedTagValueFilter,
    flagTypeFilter,
    searchQuery,
    sortBy,
    dateFrom,
    dateTo,
  ]);

  const archivedFlags = useMemo(() => {
    let result = flags.filter((f) => f.archived);
    if (selectedTagTypeFilter) {
      result = result.filter((f) =>
        f.tags.some(
          (tg) =>
            tg.tagId === selectedTagTypeFilter &&
            (!selectedTagValueFilter || tg.value === selectedTagValueFilter),
        ),
      );
    }
    if (flagTypeFilter) result = result.filter((f) => f.flagType === flagTypeFilter);
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
  }, [
    flags,
    selectedTagTypeFilter,
    selectedTagValueFilter,
    flagTypeFilter,
    searchQuery,
    sortBy,
    dateFrom,
    dateTo,
  ]);

  const visibleFlags = filtered.slice(0, displayLimit);
  const hasMoreFlags = displayLimit < filtered.length;

  const showMoreFlags = () => setDisplayLimit((prev) => Math.min(prev + 10, filtered.length));
  const showAllFlags = () => setDisplayLimit(filtered.length);

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
  };
}
