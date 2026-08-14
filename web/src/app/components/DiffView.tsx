import { isValidElement } from 'react';
import { motion } from 'motion/react';
import { useT } from '@/i18n';
import type { DiffChange } from '@/shared/diffUtils';

export type { DiffChange };

interface DiffViewProps {
  changes: DiffChange[];
}

function rowClasses(hasRemoved: boolean, hasAdded: boolean, compact: boolean) {
  const py = compact ? 'py-1.5' : 'py-2.5';
  if (!hasRemoved && !hasAdded) {
    return `border-l-2 border-l-muted-foreground/30 ${py}`;
  }
  if (hasRemoved && hasAdded) {
    return `border-l-2 border-l-warning ${py}`;
  }
  if (hasRemoved) {
    return `border-l-2 border-l-destructive bg-destructive/30 dark:bg-destructive/10 ${py}`;
  }
  return `border-l-2 border-l-success bg-success/30 dark:bg-success/10 ${py}`;
}

function renderValue(value: DiffChange['before'] | DiffChange['after'], isOld: boolean) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground/70 dark:text-muted-foreground italic">—</span>;
  }
  if (isValidElement(value)) {
    return value;
  }
  if (isOld) {
    return (
      <span className="text-caption text-muted-foreground line-through">− {String(value)}</span>
    );
  }
  return (
    <span className="text-caption font-medium text-foreground/90">+ {String(value)}</span>
  );
}

function DiffRow({
  change,
  index,
  compact,
}: {
  change: DiffChange;
  index: number;
  compact: boolean;
}) {
  const hasRemoved = change.before !== null && change.before !== undefined && change.before !== '';
  const hasAdded = change.after !== null && change.after !== undefined && change.after !== '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index, 5) * 0.04 }}
      className={`pl-3 pr-3 ${rowClasses(hasRemoved, hasAdded, compact)}`}
    >
      <div className="text-caption font-medium text-muted-foreground mb-0.5">
        {change.label}
      </div>
      <div className="flex items-start gap-2 min-w-0">
        {hasRemoved && (
          <span className="min-w-0 flex-1 break-words">
            {renderValue(change.before, true)}
          </span>
        )}
        {hasRemoved && hasAdded && (
          <span className="text-foreground/30 shrink-0 text-body-sm pt-0.5">→</span>
        )}
        {hasAdded && (
          <span className="min-w-0 flex-1 break-words">
            {renderValue(change.after, false)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function DiffView({ changes }: DiffViewProps) {
  const t = useT();
  if (changes.length === 0) {
    return (
      <p className="text-body-sm text-muted-foreground text-center py-4">{t('common.noChanges')}</p>
    );
  }

  const compact = changes.length > 6;

  const groups = new Map<string | undefined, DiffChange[]>();
  for (const change of changes) {
    const key = change.group;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(change);
  }

  return (
    <div className="space-y-4 max-h-[44vh] overflow-y-auto pr-1">
      {Array.from(groups.entries()).map(([group, items]) => (
        <div key={group ?? '__default'} className="space-y-2">
          {group && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-caption font-medium text-muted-foreground">
              {group} · {items.length}
            </span>
          )}
          <div className="space-y-1">
            {items.map((change, i) => (
              <DiffRow key={`${change.field}-${i}`} change={change} index={i} compact={compact} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
