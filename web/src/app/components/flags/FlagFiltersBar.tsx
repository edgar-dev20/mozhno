import { lazy, Suspense } from 'react';
import { Rocket, ShieldOff } from '@/shared/icons';
import { SearchInput, adjustColor } from '@/shared';
import type { Tag as TagType } from '@/api';
import { useT } from '@/i18n';
import { format, parseISO } from 'date-fns';

const DateRangePicker = lazy(() =>
  import('@/shared/components/DateRangePicker').then((m) => ({ default: m.DateRangePicker })),
);

interface FlagFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  flagTypeFilter: string | null;
  onFlagTypeFilterChange: (t: string | null) => void;
  dateFrom: string;
  dateTo: string;
  onDateChange: (from: string, to: string) => void;
  sortBy: 'name' | 'createdAt';
  onSortByChange: (s: 'name' | 'createdAt') => void;
  tags: TagType[];
  selectedTagTypeFilter: number | null;
  onTagTypeFilterChange: (id: number | null) => void;
  selectedTagValueFilter: string | null;
  onTagValueFilterChange: (v: string | null) => void;
  uniqueTagValues: (typeId: number) => string[];
}

export function FlagFiltersBar({
  searchQuery,
  onSearchChange,
  flagTypeFilter,
  onFlagTypeFilterChange,
  dateFrom,
  dateTo,
  onDateChange,
  sortBy,
  onSortByChange,
  tags,
  selectedTagTypeFilter,
  onTagTypeFilterChange,
  selectedTagValueFilter,
  onTagValueFilterChange,
  uniqueTagValues,
}: FlagFiltersBarProps) {
  const t = useT();
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t('flags.searchPlaceholder')}
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onFlagTypeFilterChange(null)}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
              !flagTypeFilter
                ? 'bg-chart-4/10 text-chart-4 border-chart-4/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => onFlagTypeFilterChange(flagTypeFilter === 'RELEASE' ? null : 'RELEASE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
              flagTypeFilter === 'RELEASE'
                ? 'bg-info/10 text-info border-info/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            <Rocket size={12} />
            {t('flags.release')}
          </button>
          <button
            onClick={() =>
              onFlagTypeFilterChange(flagTypeFilter === 'KILLSWITCH' ? null : 'KILLSWITCH')
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
              flagTypeFilter === 'KILLSWITCH'
                ? 'bg-chart-4/10 text-chart-4 border-chart-4/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            <ShieldOff size={12} />
            {t('flags.killswitch')}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{t('flags.created')}</span>
        <Suspense
          fallback={<div className="min-w-[260px] h-9 bg-muted rounded-lg animate-pulse" />}
        >
          <DateRangePicker
            from={dateFrom ? parseISO(dateFrom) : null}
            to={dateTo ? parseISO(dateTo) : null}
            onChange={(from, to) => {
              onDateChange(
                from ? format(from, 'yyyy-MM-dd') : '',
                to ? format(to, 'yyyy-MM-dd') : '',
              );
            }}
            presets
            className="min-w-[260px]"
          />
        </Suspense>
        <span className="text-foreground/20 dark:text-foreground/70 mx-1">|</span>
        <button
          onClick={() => onSortByChange('name')}
          className={`inline-flex items-center text-xs px-3 py-1.5 font-semibold rounded-lg transition-all border ${sortBy === 'name' ? 'bg-chart-4/10 text-chart-4 border-chart-4/20' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}
        >
          {t('flags.sortByName')}
        </button>
        <button
          onClick={() => onSortByChange('createdAt')}
          className={`inline-flex items-center text-xs px-3 py-1.5 font-semibold rounded-lg transition-all border ${sortBy === 'createdAt' ? 'bg-chart-4/10 text-chart-4 border-chart-4/20' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}
        >
          {t('flags.sortByDate')}
        </button>
      </div>

      {tags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">{t('flags.tagType')}</span>
            <button
              onClick={() => {
                onTagTypeFilterChange(null);
                onTagValueFilterChange(null);
              }}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${!selectedTagTypeFilter ? 'bg-chart-4/10 text-chart-4 border-chart-4/20' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}
            >
              {t('common.all')}
            </button>
            {tags.map((tg) => {
              const active = selectedTagTypeFilter === tg.id;
              return (
                <button
                  key={tg.id}
                  onClick={() => {
                    onTagTypeFilterChange(active ? null : tg.id);
                    onTagValueFilterChange(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${active ? 'text-white dark:brightness-[.85] dark:saturate-[.7]' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}
                  style={
                    active
                      ? { backgroundColor: tg.color, borderColor: adjustColor(tg.color, 20) }
                      : undefined
                  }
                >
                  {tg.name}
                </button>
              );
            })}
          </div>
          {selectedTagTypeFilter && (
            <div className="flex items-center gap-2 pl-4 border-l-2 border-border">
              <span className="text-sm font-medium text-muted-foreground">
                {t('flags.tagValue')}
              </span>
              <button
                onClick={() => onTagValueFilterChange(null)}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${!selectedTagValueFilter ? 'bg-chart-4/10 text-chart-4 border-chart-4/20' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}
              >
                {t('common.all')}
              </button>
              {uniqueTagValues(selectedTagTypeFilter).map((v) => {
                const tg = tags.find((t) => t.id === selectedTagTypeFilter);
                const active = selectedTagValueFilter === v;
                return (
                  <button
                    key={v}
                    onClick={() => onTagValueFilterChange(active ? null : v)}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${active ? 'text-white dark:brightness-[.85] dark:saturate-[.7]' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}
                    style={
                      active
                        ? {
                            backgroundColor: tg?.color ?? '#666',
                            borderColor: tg?.color ? adjustColor(tg.color, 20) : '#888',
                          }
                        : undefined
                    }
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
