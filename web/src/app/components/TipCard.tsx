import React, { useState, useEffect } from 'react';
import { X } from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/shared/components/Badge';
import { useT } from '@/i18n';

interface TipCardProps {
  text: string;
  label?: string;
  icon?: React.ReactNode;
  imageSrc?: string;
  storageKey?: string;
}

export function TipCard({ text, label, icon, imageSrc, storageKey }: TipCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const t = useT();
  const displayLabel = label ?? t('common.tip');

  useEffect(() => {
    if (storageKey) {
      setDismissed(localStorage.getItem(`tip-${storageKey}`) === 'dismissed');
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      localStorage.setItem(`tip-${storageKey}`, 'dismissed');
    }
  };

  const showIcon = icon || imageSrc;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gradient-start to-gradient-end" />
          <div className="p-4 pl-6 flex items-start gap-3">
            {showIcon && (
              <div className="shrink-0 rounded-xl overflow-hidden">
                {imageSrc ? (
                  <img src={imageSrc} alt="" className="w-10 h-10 object-cover" />
                ) : icon ? (
                  <div className="p-2.5 bg-muted">
                    {React.cloneElement(
                      icon as React.ReactElement<{
                        size?: number;
                        className?: string;
                        style?: React.CSSProperties;
                      }>,
                      { size: 16, className: 'text-primary' },
                    )}
                  </div>
                ) : null}
              </div>
            )}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="mb-1.5">
                <Badge variant="primary" uppercase>
                  {displayLabel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
            <button
              onClick={handleDismiss}
              aria-label={t('common.close')}
              className="shrink-0 p-1.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 text-muted-foreground/70 hover:text-foreground/80 transition-colors"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
