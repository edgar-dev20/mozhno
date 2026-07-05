import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, ArchiveRestore, User, Clock } from '@/shared/icons';
import { formatDate, getFlagTypeColor, getFlagTypeLabel } from '@/shared';
import { useT } from '@/i18n';
import type { FlagView } from '@/app/hooks/flagTypes';
import type { Tag as TagType } from '@/api';

interface ArchivedFlagsListProps {
  flags: FlagView[];
  onUnarchive: (flag: FlagView) => void;
  tags: TagType[];
}

const getTypeIcon = (t: string): React.ReactNode => {
  switch (t) {
    case 'RELEASE':
      return (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );
    case 'KILLSWITCH':
      return (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    default:
      return null;
  }
};

export function ArchivedFlagsList({ flags, onUnarchive, tags }: ArchivedFlagsListProps) {
  const t = useT();
  if (flags.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl overflow-hidden shadow-md ring-1 ring-brand/20"
    >
      <div className="px-6 py-4 bg-brand/10 border-b border-brand/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
            <Archive size={16} className="text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand">{t('flags.archivedFlagsTitle')}</h3>
            <p className="text-xs text-brand">{t('flags.archivedFlagsDesc')}</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-border">
        <AnimatePresence>
          {flags.map((flag) => (
            <motion.div
              key={flag.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between px-6 py-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-medium text-foreground/80 truncate">{flag.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold border shrink-0 leading-none ${getFlagTypeColor(flag.flagType)}`}
                  >
                    {getTypeIcon(flag.flagType)}
                    {getFlagTypeLabel(flag.flagType)}
                  </span>
                </div>
                <div className="text-xs font-mono text-muted-foreground mt-0.5">{flag.key}</div>
                {flag.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {flag.tags.map((tv, i) => {
                      const tg = tags.find((t) => t.id === tv.tagId);
                      return tg ? (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-primary-foreground shadow-sm leading-none dark:brightness-[.85] dark:saturate-[.7]"
                          style={{
                            background: tg.color,
                          }}
                        >
                          {tv.value}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/70">
                  <span className="flex items-center gap-1">
                    <User size={10} />
                    {flag.createdBy ?? '-'}
                  </span>
                  {flag.createdAt && (
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(flag.createdAt)}
                    </span>
                  )}
                </div>
                {flag.archivedBy && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-brand">
                    <span className="flex items-center gap-1">
                      <Archive size={10} />
                      {flag.archivedBy}
                    </span>
                    {flag.archivedAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatDate(flag.archivedAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 ml-4 shrink-0">
                <button
                  onClick={() => onUnarchive(flag)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/10 rounded-lg transition-colors"
                >
                  <ArchiveRestore size={13} />
                  {t('flags.restore')}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
