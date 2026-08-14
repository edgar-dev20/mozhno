import { lazy, Suspense, type ReactNode } from 'react';
import { Check, Rocket, ShieldOff } from '@/shared/icons';
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

function FilterChip({
  active,
  activeClass,
  onPress,
  children,
}: {
  active: boolean;
  activeClass?: string;
  onPress: () => void;
  children: ReactNode;
}) {
  const base = 'inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 text-caption font-semibold rounded-lg transition-all border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none';
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={active}
      className={`${base} ${
        active
          ? activeClass ?? 'bg-brand/10 text-brand dark:text-palette-brand-800 border-brand/20'
          : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
      }`}
    >
      {active && <Check size={12} aria-hidden="true" />}
      {children}
    </button>
  );
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
        <div className="w-full sm:flex-1 sm:max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={t('flags.searchPlaceholder')}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <FilterChip active={!flagTypeFilter} onPress={() => onFlagTypeFilterChange(null)}>
            {t('common.all')}
          </FilterChip>
          <FilterChip
            active={flagTypeFilter === 'RELEASE'}
            activeClass="bg-info/10 text-palette-info-700 border-info/20"
            onPress={() => onFlagTypeFilterChange(flagTypeFilter === 'RELEASE' ? null : 'RELEASE')}
          >
            <Rocket size={12} />
            {t('flags.release')}
          </FilterChip>
          <FilterChip
            active={flagTypeFilter === 'KILLSWITCH'}
            activeClass="bg-chart-4/10 text-chart-4 dark:text-palette-warning-600 border-chart-4/20"
            onPress={() =>
              onFlagTypeFilterChange(flagTypeFilter === 'KILLSWITCH' ? null : 'KILLSWITCH')
            }
          >
            <ShieldOff size={12} />
            {t('flags.killswitch')}
          </FilterChip>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="hidden sm:inline text-caption font-medium text-muted-foreground shrink-0">{t('flags.created')}</span>
        <Suspense
          fallback={<div className="min-w-[150px] sm:min-w-[260px] h-9 bg-muted rounded-lg animate-pulse" />}
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
            className="min-w-[150px] sm:min-w-[260px]"
          />
        </Suspense>
        <span className="text-foreground/20 dark:text-foreground/70 mx-1 hidden sm:inline" aria-hidden="true">|</span>
        <FilterChip
          active={sortBy === 'name'}
          onPress={() => onSortByChange('name')}
        >
          {t('flags.sortByName')}
        </FilterChip>
        <FilterChip
          active={sortBy === 'createdAt'}
          onPress={() => onSortByChange('createdAt')}
        >
          {t('flags.sortByDate')}
        </FilterChip>
      </div>

      {tags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-sm font-medium text-muted-foreground w-full sm:w-auto">{t('flags.tagType')}</span>
            <FilterChip
              active={!selectedTagTypeFilter}
              onPress={() => {
                onTagTypeFilterChange(null);
                onTagValueFilterChange(null);
              }}
            >
              {t('common.all')}
            </FilterChip>
            {tags.map((tg) => {
              const active = selectedTagTypeFilter === tg.id;
              return (
                <button
                  key={tg.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    onTagTypeFilterChange(active ? null : tg.id);
                    onTagValueFilterChange(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 text-caption font-semibold rounded-lg transition-all border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
                    active ? 'text-primary-foreground dark:brightness-[.85] dark:saturate-[.7]' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
                  }`}
                  style={
                    active
                      ? { backgroundColor: tg.color, borderColor: adjustColor(tg.color, 20) }
                      : undefined
                  }
                >
                  {active && <Check size={12} aria-hidden="true" />}
                  {tg.name}
                </button>
              );
            })}
          </div>
          {selectedTagTypeFilter && (
            <div className="flex items-center gap-2 pl-4 border-l-2 border-border flex-wrap">
              <span className="text-body-sm font-medium text-muted-foreground w-full sm:w-auto">
                {t('flags.tagValue')}
              </span>
              <FilterChip
                active={!selectedTagValueFilter}
                onPress={() => onTagValueFilterChange(null)}
              >
                {t('common.all')}
              </FilterChip>
              {uniqueTagValues(selectedTagTypeFilter).map((v) => {
                const tg = tags.find((t) => t.id === selectedTagTypeFilter);
                const active = selectedTagValueFilter === v;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onTagValueFilterChange(active ? null : v)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 text-caption font-semibold rounded-lg transition-all border focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none ${
                      active ? 'text-primary-foreground dark:brightness-[.85] dark:saturate-[.7]' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: tg?.color ?? '#666',
                            borderColor: tg?.color ? adjustColor(tg.color, 20) : '#888',
                          }
                        : undefined
                    }
                  >
                    {active && <Check size={12} aria-hidden="true" />}
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
