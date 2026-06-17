import { Settings } from '@/shared/icons';
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
    .map((sid) => segments.find((s) => s.id === sid))
    .filter(Boolean) as SegmentResponse[];
  const parts: React.ReactNode[] = [];
  const isFull = pct === 100 && activeSegs.length === 0 && !es.contextValuesJson;
  const pctClass = muted ? 'opacity-40' : '';

  parts.push(
    <span key="pct" className={`font-bold text-xs text-brand ${pctClass}`}>
      {isFull ? '100%' : `${pct}%`}
    </span>,
  );

  if (isFull) {
    parts.push(
      <span
        key="all"
        className={`text-xs ${muted ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}
      >
        {t('environment.all')}
      </span>,
    );
  } else if (activeSegs.length > 0) {
    parts.push(
      <span key="sdot" className={`text-xs text-muted-foreground/60 ${muted ? 'opacity-30' : ''}`}>
        ·
      </span>,
    );
    const visibleSegs = activeSegs.slice(0, 2);
    const overflow = activeSegs.length - visibleSegs.length;
    visibleSegs.forEach((seg, si) => {
      if (si > 0)
        parts.push(
          <span key={`sc${si}`} className="text-muted-foreground/60">
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
          <span className="text-xs">{seg.name}</span>
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
          <TooltipContent className="text-xs bg-popover text-foreground/90 border border-border shadow-lg rounded-xl px-3 py-2">
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
          <span key="cdot" className="text-muted-foreground/60">
            ·
          </span>,
        );
        parts.push(
          <span
            key="customConds"
            className={`inline-flex items-center px-1 py-0 rounded text-[9px] font-semibold tracking-wide ${muted ? 'bg-muted text-muted-foreground/50' : 'bg-brand/10 text-brand'}`}
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

export function FlagCardEnvironmentColumn({
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
  const rule = buildRule(es, segments, muted, t);

  return (
    <div className="flex-1 bg-secondary/40 rounded-xl px-4 pt-3 pb-2 ring-1 ring-border shadow-sm transition-all flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {env.name}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenEnvironment(flag, env.id)}
            className="inline-flex items-center px-1.5 py-1 text-muted-foreground bg-secondary border border-border rounded-lg hover:text-brand dark:hover:text-brand hover:border-brand/20 dark:hover:border-brand/30 hover:bg-brand/5 dark:hover:bg-brand/10 transition-all"
          >
            <Settings size={12} />
          </button>
          {es && (
            <Switch
              checked={es.enabled}
              onCheckedChange={() => onToggleFlag(flag, env.id)}
              className="data-[state=checked]:bg-brand scale-75 origin-right"
            />
          )}
        </div>
      </div>
      {es ? (
        <>
          <div className="text-xs leading-relaxed mb-2">{rule}</div>
          <div className="relative group flex-1 min-h-0 rounded-md overflow-hidden">
            {sparkBuckets.length > 0 ? (
              <>
                <button
                  onClick={() => onMetricsClick(flag.flagId, flag.name, env.id)}
                  className="w-full h-full cursor-pointer rounded-md transition-all hover:bg-sparkline-true/[0.08] dark:hover:bg-sparkline-true/[0.10]"
                >
                  <FlagSparkline data={sparkBuckets} height={56} />
                </button>
              </>
            ) : (
              <SparklinePlaceholder height={56} />
            )}
          </div>
        </>
      ) : (
        <span className="text-xs text-muted-foreground/50 italic">
          {t('environment.noStrategy')}
        </span>
      )}
    </div>
  );
}
