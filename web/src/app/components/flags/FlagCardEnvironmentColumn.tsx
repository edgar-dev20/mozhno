import { Switch } from "@/app/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/ui/tooltip";
import { SegmentIcon } from "@/app/components/SegmentIcon";
import { FlagSparkline } from "@/app/components/FlagSparkline";
import { useT } from "@/i18n";
import type { MessageKey } from "@/i18n";
import type { FlagView } from "@/app/hooks/flagTypes";
import type { SegmentResponse, ContextDefinition } from "@/api";

interface FlagCardEnvironmentColumnProps {
  env: { id: number; name: string };
  flag: FlagView;
  segments: SegmentResponse[];
  contexts: ContextDefinition[];
  sparkBuckets: { trueCount: number; falseCount: number; timeBucket: string }[];
  onOpenEnvironment: (flag: FlagView, envId: number) => void;
  onToggleFlag: (flag: FlagView, envId: number) => void;
  onMetricsClick: (flagId: number, flagName: string, envId: number) => void;
}

function buildRule(
  es: FlagView['environments'][number],
  segments: SegmentResponse[],
  contexts: ContextDefinition[],
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
    <span key="pct" className={`font-bold text-xs text-violet-600 dark:text-violet-400 ${pctClass}`}>
      {isFull ? '100%' : `${pct}%`}
    </span>,
  );

  if (isFull) {
  parts.push(
    <span key="all" className={`text-xs ${muted ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}>
      {t('environment.all')}
    </span>,
  );
  } else if (activeSegs.length > 0) {
    parts.push(<span key="sdot" className={`text-xs text-muted-foreground/60 ${muted ? 'opacity-30' : ''}`}>·</span>);
    const visibleSegs = activeSegs.slice(0, 2);
    const overflow = activeSegs.length - visibleSegs.length;
    visibleSegs.forEach((seg, si) => {
      if (si > 0) parts.push(<span key={`sc${si}`} className="text-muted-foreground/60">, </span>);
      parts.push(
        <span key={`s${si}`} className="inline-flex items-center gap-0.5" style={{ color: muted ? '#d4d4d8' : seg.color, opacity: muted ? 0.5 : 1 }}>
          <SegmentIcon name={seg.icon} size={10} />
          <span className="text-xs">{seg.name}</span>
        </span>,
      );
    });
    if (overflow > 0) {
      const restNames = activeSegs.slice(2).map((s) => s.name).join(', ');
      parts.push(
        <Tooltip key="segovf">
          <TooltipTrigger asChild>
            <span className={muted ? 'text-muted-foreground/50' : 'text-muted-foreground'}> +{overflow}</span>
          </TooltipTrigger>
          <TooltipContent className="text-xs bg-white dark:bg-neutral-800 text-foreground/90 border border-border shadow-lg rounded-xl px-3 py-2">{restNames}</TooltipContent>
        </Tooltip>,
      );
    }
  }

  if (es.contextValuesJson) {
    try {
      const parsed: { cd: number; op: string; val: string }[] = JSON.parse(es.contextValuesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const groups = new Map<string, string[]>();
        for (const c of parsed) {
          const ctx = contexts.find((x) => x.id === c.cd);
          if (!ctx) continue;
          const key = `${ctx.name} ${c.op || 'in'}`;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(c.val || '');
        }
        const collapsed: string[] = [];
        for (const [key, vals] of groups) {
          collapsed.push(vals.length === 1 ? `${key.split(' ')[0]}=${vals[0]}` : `${key.split(' ')[0]}: ${vals.join(', ')}`);
        }
        if (collapsed.length > 0) {
          parts.push(<span key="cdot" className="text-muted-foreground/60">·</span>);
          const extra = collapsed.length - 1;
          parts.push(<span key="first" className={muted ? 'text-muted-foreground/50' : 'text-muted-foreground'}>{collapsed[0]}</span>);
          if (extra > 0) {
            parts.push(<span key="more" className={muted ? 'text-muted-foreground/50' : 'text-muted-foreground'}>{t('flags.andMore', { count: String(extra) })}</span>);
          }
        }
      }
    } catch { /* ignore parse errors */ }
  }

  return <span className="inline-flex items-baseline flex-wrap gap-x-0.5">{parts}</span>;
}

function PlaceholderSparkline() {
  return (
    <div className="w-full h-full flex items-end justify-center gap-[3px] pb-1">
      {[
        { falsePct: 20, truePct: 10 },
        { falsePct: 35, truePct: 25 },
        { falsePct: 45, truePct: 40 },
      ].map((col, i) => (
        <div key={i} className="flex flex-col w-[6px]" style={{ height: `${col.falsePct + col.truePct}%` }}>
          <div className="w-full rounded-t-[2px]" style={{ height: `${(col.truePct / (col.falsePct + col.truePct)) * 100}%`, backgroundColor: 'rgba(139, 92, 246, 0.18)' }} />
          <div className="w-full flex-1" style={{ backgroundColor: 'rgba(196, 181, 253, 0.15)' }} />
        </div>
      ))}
    </div>
  );
}

export function FlagCardEnvironmentColumn({
  env,
  flag,
  segments,
  contexts,
  sparkBuckets,
  onOpenEnvironment,
  onToggleFlag,
  onMetricsClick,
}: FlagCardEnvironmentColumnProps) {
  const t = useT();
  const es = flag.environments[env.id];
  const muted = !es || !es.enabled;
  const rule = buildRule(es, segments, contexts, muted, t);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onOpenEnvironment(flag, env.id);
      }}
      className="flex-1 bg-secondary/60 border border-border rounded-xl px-4 pt-3 pb-2 cursor-pointer hover:bg-white dark:hover:bg-neutral-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all flex flex-col"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{env.name}</span>
        {es && (
          <span onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={es.enabled}
              onCheckedChange={() => onToggleFlag(flag, env.id)}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-gradient-start data-[state=checked]:to-gradient-end scale-75 origin-right"
            />
          </span>
        )}
      </div>
      {es ? (
        <>
          <div className="text-xs leading-relaxed mb-2">{rule}</div>
          <div className="flex-1 min-h-0 rounded-md overflow-hidden">
            {sparkBuckets.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMetricsClick(flag.flagId, flag.name, env.id);
                }}
                className="w-full h-full cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 rounded-md transition-all"
              >
                <FlagSparkline data={sparkBuckets} height={52} />
              </button>
            ) : (
              <PlaceholderSparkline />
            )}
          </div>
        </>
      ) : (
        <span className="text-xs text-muted-foreground/50 italic">{t('environment.noStrategy')}</span>
      )}
    </div>
  );
}
