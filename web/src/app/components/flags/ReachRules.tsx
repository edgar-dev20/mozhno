import { Fragment } from 'react';
import { ColorIcon } from '@/shared';
import { SegmentIcon } from '@/app/components/SegmentIcon';
import { OperatorBadge } from '@/app/components/OperatorBadge';
import { ContextType } from '@/app/components/contextTypes';
import { formatTimeConstraintValue } from '@/shared/format';
import { useT } from '@/i18n';

export interface ReachCondition {
  field: string;
  operator: string;
  contextType?: string;
  values: string[];
}

export interface ReachSource {
  key: string;
  kind: 'custom' | 'segment';
  name: string;
  color?: string;
  icon?: string;
  conditions: ReachCondition[];
}

function formatValues(values: string[], contextType?: string): string {
  const clean = values.map((v) => v.trim()).filter(Boolean);
  const disp = contextType === ContextType.TIME ? clean.map((v) => formatTimeConstraintValue(v)) : clean;
  if (disp.length === 0) return '∅';
  if (disp.length === 1) return disp[0];
  if (disp.length <= 3) return `[${disp.join(', ')}]`;
  return `[${disp.slice(0, 3).join(', ')}, +${disp.length - 3}]`;
}

/** Collapse conditions that share the same field + operator, merging their values. */
function mergeReachConditions(conditions: ReachCondition[]): ReachCondition[] {
  const byKey = new Map<string, ReachCondition>();
  for (const c of conditions) {
    const key = `${c.field}|${c.operator}`;
    const existing = byKey.get(key);
    if (existing) {
      for (const v of c.values) {
        if (!existing.values.includes(v)) existing.values.push(v);
      }
    } else {
      byKey.set(key, { ...c, values: [...c.values] });
    }
  }
  return Array.from(byKey.values());
}

interface ReachRulesProps {
  sources: ReachSource[];
}

/**
 * Shared renderer for the "who does this rule reach" summary: sources
 * (custom + each targeted segment) combined with OR, and the conditions inside
 * a source combined with AND. Used by both the environment detail panel and the
 * activation confirmation so operators, tokens and layout stay in sync.
 */
export function ReachRules({ sources }: ReachRulesProps) {
  const t = useT();
  return (
    <div className="space-y-2">
      {sources.map((src, si) => {
        const conditions = mergeReachConditions(src.conditions);
        return (
        <Fragment key={src.key}>
          {si > 0 && (
            <div className="flex items-center gap-2 py-0.5">
              <div className="flex-1 h-px bg-warning/20" />
              <span className="text-caption font-bold text-palette-warning-700 dark:text-palette-warning-600 uppercase tracking-wider px-1">
                {t('flags.ruleOr')}
              </span>
              <div className="flex-1 h-px bg-warning/20" />
            </div>
          )}
          <div className="bg-input-background/70 rounded-lg border border-brand/10 overflow-hidden">
            <div className="px-3 py-2 bg-brand/5 border-b border-brand/10 flex items-center gap-2">
              {src.kind === 'segment' && (
                <ColorIcon
                  size="xs"
                  color={src.color ?? '#6b7280'}
                  icon={<SegmentIcon name={src.icon ?? 'Users'} size={9} />}
                  darkDim={false}
                />
              )}
              <span className="text-caption font-semibold text-brand dark:text-palette-brand-800 truncate">{src.name}</span>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              {conditions.length === 0 ? (
                <div className="text-caption text-muted-foreground italic">
                  {t('flags.activateSegmentAnyone')}
                </div>
              ) : (
                conditions.map((c, ci) => (
                  <div key={ci} className="space-y-1.5">
                    {ci > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-brand/15" />
                        <span className="text-caption font-bold text-brand uppercase tracking-wider px-1">
                          {t('flags.ruleAnd')}
                        </span>
                        <div className="flex-1 h-px bg-brand/15" />
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-caption">
                      <span className="font-semibold text-foreground/80">{c.field}</span>
                      <OperatorBadge operator={c.operator} contextType={c.contextType} />
                      <span className="break-all min-w-0 text-foreground/80">
                        {formatValues(c.values, c.contextType)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Fragment>
        );
      })}
    </div>
  );
}
