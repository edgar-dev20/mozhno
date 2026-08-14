import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DiffView } from '@/app/components/DiffView';
import { useT } from '@/i18n';
import type { DiffChange } from '@/shared/diffUtils';

interface InlineDiffBarProps {
  changes: DiffChange[];
}

export function InlineDiffBar({ changes }: InlineDiffBarProps) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && changes.length > 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      ref.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    }
  }, [changes.length]);

  return (
    <AnimatePresence mode="wait">
      {changes.length > 0 && (
        <motion.div
          ref={ref}
          key="diff-bar"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="will-change-transform"
        >
          <div className="border-t border-border bg-secondary/30 dark:bg-secondary/10">
            <div className="px-6 pt-4 pb-1 flex items-center gap-2">
              <span className="text-caption font-semibold text-muted-foreground">
                {t('common.reviewChanges')}
              </span>
              <span className="text-caption font-medium text-muted-foreground tabular-nums">
                {changes.length}
              </span>
            </div>
            <div className="px-6 pb-4">
              <DiffView changes={changes} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
