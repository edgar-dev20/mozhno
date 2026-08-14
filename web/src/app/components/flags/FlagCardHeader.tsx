import { useState, useCallback, useMemo, memo } from 'react';
import { Switch } from '@/app/components/ui/switch';
import { FlagEnabledDot } from '@/app/components/flags/FlagEnabledDot';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useT } from '@/i18n';
import { readableColorForBg } from '@/shared/color';
import type { FlagView } from '@/app/hooks/flagTypes';
import type { Tag as TagType } from '@/api';

const getTypeIcon = (t: string, size = 10) => {
  if (t === 'RELEASE') {
    return (
      <svg
        width={size}
        height={size}
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
  }
  if (t === 'KILLSWITCH') {
    return (
      <svg
        width={size}
        height={size}
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
  }
  return null;
};

const getIconColor = (t: string) =>
  t === 'RELEASE'
    ? 'text-palette-info-600 dark:text-palette-info-700 bg-info/10'
    : 'text-palette-warning-600 dark:text-palette-warning-700 bg-chart-4/10';

interface FlagCardHeaderProps {
  flag: FlagView;
  expanded: boolean;
  onToggleExpand: () => void;
  environments: { id: number; name: string }[];
  tags: TagType[];
  onToggleFlag: (flag: FlagView, envId: number) => void;
  canWrite?: boolean;
}

export const FlagCardHeader = memo(function FlagCardHeader({
  flag,
  expanded,
  onToggleExpand,
  environments,
  tags,
  onToggleFlag,
  canWrite = false,
}: FlagCardHeaderProps) {
  const t = useT();
  const [glowKeys, setGlowKeys] = useState<Record<number, number>>({});

  const tagMap = useMemo(() => {
    const map = new Map<number, TagType>();
    for (const tg of tags) map.set(tg.id, tg);
    return map;
  }, [tags]);

  const handleToggle = useCallback(
    (envId: number) => {
      const wasEnabled = !!flag.environments[envId]?.enabled;
      if (!wasEnabled) {
        setGlowKeys((prev) => ({ ...prev, [envId]: (prev[envId] ?? 0) + 1 }));
      }
      onToggleFlag(flag, envId);
    },
    [flag, onToggleFlag],
  );

  return (
    <>
      <button
        type="button"
        id={`flag-card-header-${flag.key}`}
        aria-expanded={expanded}
        aria-controls={`flag-card-detail-${flag.key}`}
        onClick={onToggleExpand}
        className="flex-1 min-w-0 flex items-center gap-3 text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <div className={`p-1.5 rounded-lg shrink-0 ${getIconColor(flag.flagType)}`}>
          {getTypeIcon(flag.flagType, 16)}
        </div>
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-semibold text-h3 text-foreground truncate transition-all">
            {flag.name}
          </span>
          {flag.archived && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-caption font-medium bg-muted text-muted-foreground border border-border/50 shrink-0">
              {t('audit.action.archived')}
            </span>
          )}
          {!expanded &&
            flag.tags.length > 0 &&
            flag.tags.slice(0, 5).map((tv, i) => {
              const tg = tagMap.get(tv.tagId);
              return tg ? (
                <span
                  key={i}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-caption font-medium leading-none dark:brightness-[.85] dark:saturate-[.7]"
                  style={{ background: tg.color, color: readableColorForBg(tg.color) }}
                >
                  {tv.value}
                </span>
              ) : null;
            })}
          {!expanded && flag.tags.length > 5 && (
            <span className="text-caption text-muted-foreground">+{flag.tags.length - 5}</span>
          )}
        </div>
      </button>
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-3">
          {!expanded &&
            environments.map((env) => {
              const es = flag.environments[env.id];
              return (
                <div key={env.id} className="flex items-center gap-1 sm:gap-1.5">
                  <span className="hidden sm:inline text-caption font-medium text-muted-foreground">
                    {env.name}
                  </span>
                  {es && (
                    <span
                      key={`glow-${env.id}-${glowKeys[env.id] ?? 0}`}
                      className={(glowKeys[env.id] ?? 0) > 0 ? 'animate-flag-on' : ''}
                    >
                      {canWrite ? (
                        <Switch
                          checked={es.enabled}
                          onCheckedChange={() => handleToggle(env.id)}
                          aria-label={`${flag.name} — ${env.name}`}
                          className="data-[state=checked]:bg-brand"
                        />
                      ) : (
                        <FlagEnabledDot flagName={flag.name} envName={env.name} enabled={es.enabled} />
                      )}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
        <button
          type="button"
          onClick={onToggleExpand}
          aria-hidden="true"
          tabIndex={-1}
          className="inline-flex items-center justify-center p-1.5 sm:p-0 -mr-1 sm:mr-0 rounded-lg text-muted-foreground group-hover:text-brand hover:bg-accent sm:hover:bg-transparent transition-colors"
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
    </>
  );
});
