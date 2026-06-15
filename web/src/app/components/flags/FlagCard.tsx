import { motion, AnimatePresence } from 'motion/react';
import { FlagCardHeader } from '@/app/components/flags/FlagCardHeader';
import { FlagCardDetail } from '@/app/components/flags/FlagCardDetail';
import type { FlagView } from '@/app/hooks/flagTypes';
import type { SegmentResponse, Tag as TagType, ContextDefinition } from '@/api';

export interface FlagCardProps {
  flag: FlagView;
  expanded: boolean;
  onToggleExpand: () => void;
  onOpenGeneral: (flag: FlagView) => void;
  onOpenEnvironment: (flag: FlagView, envId: number) => void;
  onToggleFlag: (flag: FlagView, envId: number) => void;
  onMetricsClick: (flagId: number, flagName: string, envId: number) => void;
  environments: { id: number; name: string }[];
  segments: SegmentResponse[];
  tags: TagType[];
  contexts: ContextDefinition[];
  sparklineData: Map<string, { trueCount: number; falseCount: number; timeBucket: string }[]>;
}

export function FlagCard(props: FlagCardProps) {
  const { flag, expanded, onToggleExpand } = props;

  return (
    <motion.div
      key={flag.key}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      layout
      className="group bg-card rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      id={`flag-card-${flag.key}`}
    >
      <div className="flex gap-4 px-4 py-3 cursor-pointer" onClick={onToggleExpand}>
        <FlagCardHeader
          flag={flag}
          expanded={expanded}
          environments={props.environments}
          tags={props.tags}
          onToggleFlag={props.onToggleFlag}
        />
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
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
              contexts={props.contexts}
              sparklineData={props.sparklineData}
              onOpenGeneral={props.onOpenGeneral}
              onOpenEnvironment={props.onOpenEnvironment}
              onToggleFlag={props.onToggleFlag}
              onMetricsClick={props.onMetricsClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
