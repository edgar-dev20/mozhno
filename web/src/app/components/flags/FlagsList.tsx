import type { FlagView } from '@/app/hooks/flagTypes';
import type { SegmentResponse, Tag as TagType } from '@/api';
import { EmptyState } from '@/shared/components/EmptyState';
import { GradientButton } from '@/shared/components/GradientButton';
import { EmptyFlagsIllustration } from '@/shared/components/illustrations';
import { FlagCardSkeletonList } from '@/app/components/skeletons';
import { FlagCard } from '@/app/components/flags/FlagCard';
import { useT } from '@/i18n';

interface FlagsListProps {
  loading: boolean;
  empty: boolean;
  hasActiveFilters: boolean;
  searchQuery: string;
  onClearFilters: () => void;
  visibleFlags: FlagView[];
  expandedKeys: Set<string>;
  onToggleExpand: (key: string) => void;
  onOpenGeneral: (flag: FlagView) => void;
  onOpenEnvironment: (flag: FlagView, envId: number) => void;
  onToggleFlag: (flag: FlagView, envId: number) => void;
  onMetricsClick: (flagId: number, flagName: string, envId: number) => void;
  onCreateClick: () => void;
  canWrite?: boolean;
  environments: { id: number; name: string }[];
  segments: SegmentResponse[];
  tags: TagType[];
  sparklineData: Map<string, { trueCount: number; falseCount: number; timeBucket: string }[]>;
  hasMoreFlags: boolean;
  totalFiltered: number;
  onShowMore: () => void;
  onShowAll: () => void;
}

export function FlagsList({
  loading,
  empty,
  hasActiveFilters,
  searchQuery,
  onClearFilters,
  visibleFlags,
  expandedKeys,
  onToggleExpand,
  onOpenGeneral,
  onOpenEnvironment,
  onToggleFlag,
  onMetricsClick,
  onCreateClick,
  canWrite = false,
  environments,
  segments,
  tags,
  sparklineData,
  hasMoreFlags,
  totalFiltered,
  onShowMore,
  onShowAll,
}: FlagsListProps) {
  const t = useT();

  if (loading) {
    return (
      <div className="space-y-3">
        <FlagCardSkeletonList count={3} />
      </div>
    );
  }

  if (empty) {
    return (
      <div className="space-y-3">
        {hasActiveFilters ? (
          <EmptyState
            illustration={<EmptyFlagsIllustration />}
            title={t('flags.noResults')}
            description={t('flags.noResultsDescription', {
              query: searchQuery.trim() || t('flags.searchPlaceholder'),
            })}
            buttonLabel={t('flags.clearFilters')}
            onAction={onClearFilters}
          />
        ) : (
          <EmptyState
            illustration={<EmptyFlagsIllustration />}
            title={t('flags.noFlags')}
            description={t('flags.noFlagsDescription')}
            buttonLabel={t('flags.create')}
            onAction={canWrite ? onCreateClick : undefined}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleFlags.map((flag) => (
        <FlagCard
          key={flag.key}
          flag={flag}
          expanded={expandedKeys.has(flag.key)}
          onToggleExpand={onToggleExpand}
          onOpenGeneral={onOpenGeneral}
          onOpenEnvironment={onOpenEnvironment}
          onToggleFlag={onToggleFlag}
          onMetricsClick={onMetricsClick}
          canWrite={canWrite}
          environments={environments}
          segments={segments}
          tags={tags}
          sparklineData={sparklineData}
        />
      ))}
      {hasMoreFlags && (
        <div className="flex items-center justify-center gap-3 pt-3 pb-1">
          <GradientButton variant="secondary" onClick={onShowMore}>
            {t('flags.showMore')} ({totalFiltered - visibleFlags.length})
          </GradientButton>
          <GradientButton
            variant="secondary"
            onClick={onShowAll}
            className="bg-brand/10 border-brand/20 text-brand hover:bg-brand/20"
          >
            {t('flags.showAll')} ({totalFiltered})
          </GradientButton>
        </div>
      )}
    </div>
  );
}
