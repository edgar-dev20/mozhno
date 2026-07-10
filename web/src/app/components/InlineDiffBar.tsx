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
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [changes.length]);

  return (
    <AnimatePresence mode="wait">
      {changes.length > 0 && (
        <motion.div
          ref={ref}
          key="diff-bar"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'top' }}
          className="will-change-transform"
        >
          <div className="border-t border-border bg-secondary/30 dark:bg-secondary/10">
            <div className="px-6 pt-4 pb-1 flex items-center gap-2">
              <span className="text-caption font-semibold text-muted-foreground/70">
                {t('common.reviewChanges')}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground/50 tabular-nums">
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
