import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FlagCardHeader } from '@/app/components/flags/FlagCardHeader';
import { FlagCardDetail } from '@/app/components/flags/FlagCardDetail';
import type { FlagView } from '@/app/hooks/flagTypes';
import type { SegmentResponse, Tag as TagType } from '@/api';

export interface FlagCardProps {
  flag: FlagView;
  expanded: boolean;
  onToggleExpand: (key: string) => void;
  onOpenGeneral: (flag: FlagView) => void;
  onOpenEnvironment: (flag: FlagView, envId: number) => void;
  onToggleFlag: (flag: FlagView, envId: number) => void;
  onMetricsClick: (flagId: number, flagName: string, envId: number) => void;
  canWrite?: boolean;
  environments: { id: number; name: string }[];
  segments: SegmentResponse[];
  tags: TagType[];
  sparklineData: Map<string, { trueCount: number; falseCount: number; timeBucket: string }[]>;
}

export const FlagCard = memo(function FlagCard(props: FlagCardProps) {
  const { flag, expanded, onToggleExpand } = props;

  const handleToggleExpand = useCallback(() => onToggleExpand(flag.key), [onToggleExpand, flag.key]);

  return (
    <motion.div
      key={flag.key}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      layout
      className={`group bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden ${flag.archived ? 'opacity-50 grayscale-[0.3]' : ''}`}
      id={`flag-card-${flag.key}`}
    >
      <div className="flex items-center gap-1.5 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3">
        <FlagCardHeader
          flag={flag}
          expanded={expanded}
          onToggleExpand={handleToggleExpand}
          environments={props.environments}
          tags={props.tags}
          onToggleFlag={props.onToggleFlag}
          canWrite={props.canWrite}
        />
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={`flag-card-detail-${flag.key}`}
            role="region"
            aria-labelledby={`flag-card-header-${flag.key}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <FlagCardDetail
              flag={flag}
              environments={props.environments}
              segments={props.segments}
              tags={props.tags}
              sparklineData={props.sparklineData}
              onOpenGeneral={props.onOpenGeneral}
              onOpenEnvironment={props.onOpenEnvironment}
              onToggleFlag={props.onToggleFlag}
              onMetricsClick={props.onMetricsClick}
              canWrite={props.canWrite}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
