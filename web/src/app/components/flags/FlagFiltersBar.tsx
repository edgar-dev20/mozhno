import { Rocket, ShieldOff } from '@/shared/icons';
import { SearchInput, DateRangePicker, adjustColor } from '@/shared';
import type { Tag as TagType } from '@/api';
import { useT } from '@/i18n';

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
  searchQuery, onSearchChange,
  flagTypeFilter, onFlagTypeFilterChange,
  dateFrom, dateTo, onDateChange,
  sortBy, onSortByChange,
  tags,
  selectedTagTypeFilter, onTagTypeFilterChange,
  selectedTagValueFilter, onTagValueFilterChange,
  uniqueTagValues,
}: FlagFiltersBarProps) {
  const t = useT();
  return (
    <>
      <div className="flex items-center gap-3">
        <SearchInput value={searchQuery} onChange={onSearchChange} placeholder={t('flags.searchPlaceholder')} />
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onFlagTypeFilterChange(null)}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              !flagTypeFilter
                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => onFlagTypeFilterChange(flagTypeFilter === 'RELEASE' ? null : 'RELEASE')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              flagTypeFilter === 'RELEASE'
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'
            }`}
          >
            <Rocket size={12} />
            {t('flags.release')}
          </button>
          <button
            onClick={() => onFlagTypeFilterChange(flagTypeFilter === 'KILLSWITCH' ? null : 'KILLSWITCH')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              flagTypeFilter === 'KILLSWITCH'
                ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
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
        <DateRangePicker
          from={dateFrom ? new Date(dateFrom) : null}
          to={dateTo ? new Date(dateTo) : null}
          onChange={(from, to) => {
            onDateChange(from ? from.toISOString().slice(0, 10) : '', to ? to.toISOString().slice(0, 10) : '');
          }}
          presets
          className="min-w-[260px]"
        />
        <span className="text-foreground/20 dark:text-foreground/70 mx-1">|</span>
        <button onClick={() => onSortByChange('name')} className={`inline-flex items-center text-xs px-3 py-1.5 font-semibold rounded-xl transition-all border ${sortBy === 'name' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}>{t('flags.sortByName')}</button>
        <button onClick={() => onSortByChange('createdAt')} className={`inline-flex items-center text-xs px-3 py-1.5 font-semibold rounded-xl transition-all border ${sortBy === 'createdAt' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}>{t('flags.sortByDate')}</button>
      </div>

      {tags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">{t('flags.tagType')}</span>
            <button onClick={() => { onTagTypeFilterChange(null); onTagValueFilterChange(null); }} className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${!selectedTagTypeFilter ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}>{t('common.all')}</button>
            {tags.map(tg => {
              const active = selectedTagTypeFilter === tg.id;
              return (
                <button key={tg.id} onClick={() => { onTagTypeFilterChange(active ? null : tg.id); onTagValueFilterChange(null); }} className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${active ? 'text-white' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`} style={active ? { backgroundColor: tg.color, borderColor: adjustColor(tg.color, 20) } : undefined}>{tg.name}</button>
              );
            })}
          </div>
          {selectedTagTypeFilter && (
            <div className="flex items-center gap-2 pl-4 border-l-2 border-border">
              <span className="text-sm font-medium text-muted-foreground">{t('flags.tagValue')}</span>
              <button onClick={() => onTagValueFilterChange(null)} className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${!selectedTagValueFilter ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`}>{t('common.all')}</button>
              {uniqueTagValues(selectedTagTypeFilter).map(v => {
                const tg = tags.find(t => t.id === selectedTagTypeFilter);
                const active = selectedTagValueFilter === v;
                return <button key={v} onClick={() => onTagValueFilterChange(active ? null : v)} className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${active ? 'text-white' : 'bg-accent text-muted-foreground hover:bg-accent/80 border-transparent'}`} style={active ? { backgroundColor: tg?.color ?? '#666', borderColor: tg?.color ? adjustColor(tg.color, 20) : '#888' } : undefined}>{v}</button>;
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
