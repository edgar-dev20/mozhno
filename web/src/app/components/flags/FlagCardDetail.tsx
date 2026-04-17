import { Settings, Clock, User } from "@/shared/icons";
import { formatDate, adjustColor } from "@/shared";
import { useT } from "@/i18n";
import { FlagCardEnvironmentColumn } from "@/app/components/flags/FlagCardEnvironmentColumn";
import type { FlagView } from "@/app/hooks/flagTypes";
import type { SegmentResponse, Tag as TagType, ContextDefinition } from "@/api";

interface FlagCardDetailProps {
  flag: FlagView;
  environments: { id: number; name: string }[];
  segments: SegmentResponse[];
  tags: TagType[];
  contexts: ContextDefinition[];
  sparklineData: Map<string, { trueCount: number; falseCount: number; timeBucket: string }[]>;
  onOpenGeneral: (flag: FlagView) => void;
  onOpenEnvironment: (flag: FlagView, envId: number) => void;
  onToggleFlag: (flag: FlagView, envId: number) => void;
  onMetricsClick: (flagId: number, flagName: string, envId: number) => void;
}

export function FlagCardDetail({
  flag,
  environments,
  segments,
  tags,
  contexts,
  sparklineData,
  onOpenGeneral,
  onOpenEnvironment,
  onToggleFlag,
  onMetricsClick,
}: FlagCardDetailProps) {
  const t = useT();
  return (
    <div className="flex gap-4 px-4 pb-3 border-t border-border pt-3">
      <div className="flex-[1] min-w-0 flex flex-col">
        <div className="flex-1 min-h-0">
          <div className="mt-0.5">
            <span className="text-xs font-mono text-muted-foreground">{flag.key}</span>
          </div>
          {flag.description && (
            <div className="text-xs text-foreground/60 dark:text-muted-foreground/60 mt-0.5 mb-1 line-clamp-3 break-words">
              {flag.description}
            </div>
          )}
          {flag.tags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {flag.tags.map((tv, i) => {
                const tg = tags.find((t) => t.id === tv.tagId);
                return tg ? (
                  <span
                    key={i}
                    className="inline-flex items-center px-1.5 py-1 rounded text-xs font-medium text-white shadow-sm leading-none"
                    style={{ backgroundImage: `linear-gradient(to right, ${tg.color}, ${adjustColor(tg.color, 20)})` }}
                  >
                    {tv.value}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground/70 mt-auto pt-2 shrink-0">
          {flag.createdBy && (
            <span className="flex items-center gap-1">
              <User size={10} />
              {flag.createdBy}
            </span>
          )}
          {flag.createdAt && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {formatDate(flag.createdAt)}
            </span>
          )}
        </div>
        <div className="pt-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenGeneral(flag);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary border border-border rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
          >
            <Settings size={12} />
            {t('common.edit')}
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-[2] min-w-0">
        {environments.map((env) => {
          const sparkKey = `${flag.flagId}-${env.id}`;
          const sparkBuckets = sparklineData.get(sparkKey) ?? [];
          return (
            <FlagCardEnvironmentColumn
              key={env.id}
              env={env}
              flag={flag}
              segments={segments}
              contexts={contexts}
              sparkBuckets={sparkBuckets}
              onOpenEnvironment={onOpenEnvironment}
              onToggleFlag={onToggleFlag}
              onMetricsClick={onMetricsClick}
            />
          );
        })}
      </div>
    </div>
  );
}
