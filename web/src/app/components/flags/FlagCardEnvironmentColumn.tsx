import { useState, useCallback, useMemo, memo } from 'react';
import { Settings, BarChart3 } from '@/shared/icons';
import { Switch } from '@/app/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/components/ui/tooltip';
import { SegmentIcon } from '@/app/components/SegmentIcon';
import { FlagSparkline, SparklinePlaceholder } from '@/app/components/FlagSparkline';
import { useT } from '@/i18n';
import type { MessageKey } from '@/i18n';
import type { FlagView } from '@/app/hooks/flagTypes';
import type { SegmentResponse } from '@/api';

interface FlagCardEnvironmentColumnProps {
  env: { id: number; name: string };
  flag: FlagView;
  segments: SegmentResponse[];
  sparkBuckets: { trueCount: number; falseCount: number; timeBucket: string }[];
  onOpenEnvironment: (flag: FlagView, envId: number) => void;
  onToggleFlag: (flag: FlagView, envId: number) => void;
  onMetricsClick: (flagId: number, flagName: string, envId: number) => void;
}

function buildRule(
  es: FlagView['environments'][number],
  segments: SegmentResponse[],
  muted: boolean,
  t: (key: MessageKey) => string,
) {
  if (!es) return <span className="text-muted-foreground/50">—</span>;

  const pct = es.percentage ?? 100;
  const activeSegs = (es.segmentIds ?? [])
    .map((sid) => Array.isArray(segments) ? segments.find((s) => s.id === sid) : undefined)
    .filter(Boolean) as SegmentResponse[];
  const parts: React.ReactNode[] = [];
  const isFull = pct === 100 && activeSegs.length === 0 && !es.contextValuesJson;
  const pctClass = muted ? 'opacity-40' : '';

  parts.push(
    <span key="pct" className={`font-bold text-caption text-brand ${pctClass}`}>
      {isFull ? '100%' : `${pct}%`}
    </span>,
  );

  if (isFull) {
    parts.push(
      <span
        key="all"
        className={`text-caption ${muted ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}
      >
        {t('environment.all')}
      </span>,
    );
  } else if (activeSegs.length > 0) {
    parts.push(
      <span key="sdot" className={`text-caption text-muted-foreground ${muted ? 'opacity-30' : ''}`}>
        ·
      </span>,
    );
    const visibleSegs = activeSegs.slice(0, 2);
    const overflow = activeSegs.length - visibleSegs.length;
    visibleSegs.forEach((seg, si) => {
      if (si > 0)
        parts.push(
          <span key={`sc${si}`} className="text-muted-foreground">
            ,{' '}
          </span>,
        );
      parts.push(
        <span
          key={`s${si}`}
          className="inline-flex items-center gap-0.5"
          style={{ color: muted ? '#d4d4d8' : seg.color, opacity: muted ? 0.5 : 1 }}
        >
          <SegmentIcon name={seg.icon} size={10} />
          <span className="text-caption">{seg.name}</span>
        </span>,
      );
    });
    if (overflow > 0) {
      const restNames = activeSegs
        .slice(2)
        .map((s) => s.name)
        .join(', ');
      parts.push(
        <Tooltip key="segovf">
          <TooltipTrigger asChild>
            <span className={muted ? 'text-muted-foreground/50' : 'text-muted-foreground'}>
              {' '}
              +{overflow}
            </span>
          </TooltipTrigger>
          <TooltipContent className="text-caption bg-popover text-foreground/90 border border-border shadow-lg rounded-xl px-3 py-2">
            {restNames}
          </TooltipContent>
        </Tooltip>,
      );
    }
  }

  if (es.contextValuesJson) {
    try {
      const parsed: unknown = JSON.parse(es.contextValuesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parts.push(
          <span key="cdot" className="text-muted-foreground">
            ·
          </span>,
        );
        parts.push(
          <span
            key="customConds"
            className={`inline-flex items-center px-1 py-0 rounded text-caption font-semibold tracking-wide ${muted ? 'bg-muted text-muted-foreground/50' : 'bg-brand/10 text-brand dark:text-palette-brand-800'}`}
          >
            +{parsed.length}
          </span>,
        );
      }
    } catch {
      /* ignore parse errors */
    }
  }

  return <span className="inline-flex items-center flex-wrap gap-x-0.5">{parts}</span>;
}

export const FlagCardEnvironmentColumn = memo(function FlagCardEnvironmentColumn({
  env,
  flag,
  segments,
  sparkBuckets,
  onOpenEnvironment,
  onToggleFlag,
  onMetricsClick,
}: FlagCardEnvironmentColumnProps) {
  const t = useT();
  const es = flag.environments[env.id];
  const muted = !es || !es.enabled;
  const rule = useMemo(() => buildRule(es, segments, muted, t), [es, segments, muted, t]);

  const [glowKey, setGlowKey] = useState(0);

  const handleToggle = useCallback(() => {
    if (es && !es.enabled) setGlowKey((k) => k + 1);
    onToggleFlag(flag, env.id);
  }, [es, flag, env.id, onToggleFlag]);

  return (
    <div className="w-full sm:flex-1 sm:min-w-0 bg-secondary/40 rounded-xl px-3 sm:px-4 pt-3 pb-2 ring-1 ring-border shadow-sm transition-all flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption font-medium text-muted-foreground">
          {env.name}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenEnvironment(flag, env.id)}
            aria-label={t('flags.environmentSettingsBtn')}
            className="inline-flex items-center px-1.5 py-1 text-muted-foreground bg-secondary border border-border rounded-lg hover:text-brand dark:hover:text-brand hover:border-brand/20 dark:hover:border-brand/30 hover:bg-brand/5 dark:hover:bg-brand/10 transition-all focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
          >
            <Settings size={12} />
          </button>
          {es && (
            <span key={`col-glow-${glowKey}`} className={glowKey > 0 ? 'animate-flag-on' : ''}>
              <Switch
                checked={es.enabled}
                onCheckedChange={handleToggle}
                aria-label={`${flag.name} — ${env.name}`}
                className="data-[state=checked]:bg-brand"
              />
            </span>
          )}
        </div>
      </div>
      {es ? (
        <>
          <div className="text-caption leading-relaxed mb-2">{rule}</div>
          <div className="relative group flex-1 min-h-0 rounded-md overflow-hidden hidden sm:block">
            {sparkBuckets.length > 0 ? (
              <button
                onClick={() => onMetricsClick(flag.flagId, flag.name, env.id)}
                aria-label={t('flags.metrics.chartTitle')}
                className="w-full h-full cursor-pointer rounded-md transition-all hover:bg-sparkline-true/[0.08] dark:hover:bg-sparkline-true/[0.10] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              >
                <FlagSparkline data={sparkBuckets} height={56} />
              </button>
            ) : (
              <SparklinePlaceholder height={56} />
            )}
          </div>
          <div className="sm:hidden mt-auto pt-1">
            <button
              onClick={() => onMetricsClick(flag.flagId, flag.name, env.id)}
              className="inline-flex items-center px-2 py-1.5 text-muted-foreground bg-secondary border border-border rounded-lg hover:text-brand hover:border-brand/20 hover:bg-brand/5 transition-all"
              aria-label={t('flags.metrics.chartTitle')}
            >
              <BarChart3 size={13} />
            </button>
          </div>
        </>
      ) : (
        <span className="text-caption text-muted-foreground italic">
          {t('environment.noStrategy')}
        </span>
      )}
    </div>
  );
});
