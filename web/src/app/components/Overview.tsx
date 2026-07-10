import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useT, type MessageKey } from '@/i18n';
import { useAuth } from '@/app/auth/useAuth';
import {
  useProjectQuery,
  useOverviewQuery,
  useEnrichedFlagsQuery,
  useEnvironmentsQuery,
} from '@/app/hooks/queries';
import {
  Card,
  CardHeader,
  Badge,
  GradientButton,
  ErrorBox,
  InfoTip,
  getEnvColor,
  timeAgo,
  formatCompactCount,
} from '@/shared';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/app/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { computeDrift } from '@/shared/overviewAggregation';
import type { DriftRow } from '@/shared/overviewAggregation';
import { Plus, UserPlus, Key, Check, MoreHorizontal } from '@/shared/icons';
import { api } from '@/api';
import type { OverviewEnvironmentStat, OverviewResponse, AuditEvent } from '@/api';

const DRIFT_LIMIT = 8;
const EASE = [0.16, 1, 0.3, 1] as const;

type TFn = (key: MessageKey, params?: Record<string, string>) => string;

function Section({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: reduce ? 0 : index * 0.05, ease: EASE }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function Overview() {
  const t = useT();
  const { user } = useAuth();
  const role = user?.role;
  const canWrite = role === 'admin' || role === 'developer';
  const isAdmin = role === 'admin';

  const { data: project } = useProjectQuery();
  const projectId = project?.id ?? null;

  const { data: overview, isLoading, isError } = useOverviewQuery(projectId);
  const { data: enriched } = useEnrichedFlagsQuery(projectId);
  const { data: environments = [] } = useEnvironmentsQuery();

  const flags = useMemo(() => enriched?.flags ?? [], [enriched?.flags]);
  const envRefs = useMemo(
    () => environments.map((e) => ({ id: e.id, name: e.name, color: getEnvColor(e) })),
    [environments],
  );
  const envColorFor = useMemo(() => {
    const map = new Map(environments.map((e) => [e.id, getEnvColor(e)]));
    return (id: number) => map.get(id) ?? getEnvColor(id);
  }, [environments]);
  const driftRows = useMemo(() => computeDrift(flags, envRefs), [flags, envRefs]);

  if (isLoading || !overview) {
    return <OverviewSkeleton />;
  }

  if (isError) {
    return <ErrorBox>{t('overview.error')}</ErrorBox>;
  }

  const greetingName = user?.name || user?.email || '';

  const onboardingValues = Object.values(overview.onboarding);
  const onboardingDone = onboardingValues.filter(Boolean).length;
  const showOnboarding = onboardingDone < onboardingValues.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-h1 font-heading font-bold tracking-tight">
          {t('overview.greeting', { name: greetingName })}
        </h1>
        {(canWrite || isAdmin) && <HeaderActions t={t} canWrite={canWrite} isAdmin={isAdmin} />}
      </div>

      <Section index={0}>
        <OverviewKpis t={t} totals={overview.totals} />
      </Section>

      <Section index={1} className="space-y-4">
        <SubHeading title={t('overview.environments.title')} hint={t('overview.environments.subtitle')} />
        <EnvironmentsGrid t={t} environments={overview.environments} colorFor={envColorFor} />
      </Section>

      <Section index={2} className="space-y-4">
        <SubHeading title={t('overview.drift.title')} hint={t('overview.drift.subtitle')} />
        <DriftTable t={t} rows={driftRows} envRefs={envRefs} />
      </Section>

      <Section index={3}>
        {showOnboarding ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ActivityFeed t={t} events={overview.recentActivity} />
            </div>
            <OnboardingChecklist t={t} onboarding={overview.onboarding} />
          </div>
        ) : (
          <div className="lg:max-w-3xl">
            <ActivityFeed t={t} events={overview.recentActivity} />
          </div>
        )}
      </Section>
    </div>
  );
}

function HeaderActions({ t, canWrite, isAdmin }: { t: TFn; canWrite: boolean; isAdmin: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 shrink-0">
      {canWrite && (
        <GradientButton icon={<Plus size={16} />} onClick={() => navigate('/flags?new=1')}>
          {t('overview.quickActions.createFlag')}
        </GradientButton>
      )}
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t('overview.quickActions.more')}
              className="inline-flex items-center justify-center size-9 rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <MoreHorizontal size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/users')}>
              <UserPlus size={16} />
              {t('overview.quickActions.inviteUser')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/apikeys')}>
              <Key size={16} />
              {t('overview.quickActions.issueApiKey')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function SubHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <h2 className="text-h3 font-heading font-semibold tracking-tight">{title}</h2>
      <span className="text-caption text-muted-foreground/80">{hint}</span>
    </div>
  );
}

type KpiTone = 'neutral' | 'warning' | 'destructive' | 'brand';

function toneClass(tone: KpiTone, value: number): string {
  if (value <= 0 || tone === 'neutral') return '';
  if (tone === 'warning') return 'text-warning';
  if (tone === 'destructive') return 'text-destructive';
  return 'text-brand';
}

function OverviewKpis({ t, totals }: { t: TFn; totals: OverviewResponse['totals'] }) {
  const items: {
    label: string;
    value: number;
    tone: KpiTone;
    tip: string;
    sub?: string;
  }[] = [
    {
      label: t('overview.kpi.totalFlags'),
      value: totals.totalFlags,
      tone: 'neutral',
      tip: t('overview.hints.totalFlags'),
      sub:
        totals.archivedFlags > 0
          ? t('overview.kpi.archived', { count: String(totals.archivedFlags) })
          : undefined,
    },
    {
      label: t('overview.kpi.stale'),
      value: totals.staleFlags,
      tone: 'warning',
      tip: t('overview.hints.stale'),
    },
    {
      label: t('overview.kpi.killswitches'),
      value: totals.activeKillswitches,
      tone: 'destructive',
      tip: t('overview.hints.killswitches'),
    },
    {
      label: t('overview.kpi.rollouts'),
      value: totals.rolloutsInProgress,
      tone: 'brand',
      tip: t('overview.hints.rollouts'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <Card key={it.label} padded>
          <div className="flex items-center gap-2 text-caption font-medium text-muted-foreground">
            {it.label}
            <InfoTip text={it.tip} className="ml-auto" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-h2 font-heading font-bold tracking-tight tabular-nums ${toneClass(it.tone, it.value)}`}
            >
              {it.value}
            </span>
            {it.sub && <span className="text-caption text-muted-foreground/80">{it.sub}</span>}
          </div>
        </Card>
      ))}
    </div>
  );
}

function EnvironmentsGrid({
  t,
  environments,
  colorFor,
}: {
  t: TFn;
  environments: OverviewEnvironmentStat[];
  colorFor: (id: number) => string;
}) {
  if (environments.length === 0) {
    return (
      <Card padded className="py-10 text-center text-body-sm text-muted-foreground">
        {t('overview.environments.empty')}
      </Card>
    );
  }
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
      {environments.map((env, i) => (
        <EnvironmentStatCard key={env.environmentId} t={t} env={env} index={i} color={colorFor(env.environmentId)} />
      ))}
    </div>
  );
}

const RING_R = 36;
const RING_C = 2 * Math.PI * RING_R;

function EnvironmentStatCard({
  t,
  env,
  index,
  color,
}: {
  t: TFn;
  env: OverviewEnvironmentStat;
  index: number;
  color: string;
}) {
  const reduce = useReducedMotion();
  const enabledPct = env.totalFlags > 0 ? Math.round((env.enabledCount / env.totalFlags) * 100) : 0;
  const totalEval = env.evalTrue48h + env.evalFalse48h;
  const ringOffset = RING_C * (1 - enabledPct / 100);

  return (
    <Card className="h-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-6 h-6 rounded-lg grid place-items-center text-caption font-bold border"
            style={{
              backgroundColor: `${color}1f`,
              borderColor: `${color}33`,
              color: color,
            }}
          >
            {env.environmentName.charAt(0).toUpperCase()}
          </span>
          <span className="font-semibold text-body truncate">{env.environmentName}</span>
          <span className="ml-auto shrink-0 text-caption font-medium text-muted-foreground">
            {env.connectedApps > 0
              ? t('overview.environments.apps', { count: String(env.connectedApps) })
              : t('overview.environments.noApps')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 96 96" className="w-24 h-24 -rotate-90">
              <circle cx="48" cy="48" r={RING_R} fill="none" stroke="var(--color-muted)" strokeWidth="9" />
              <motion.circle
                cx="48"
                cy="48"
                r={RING_R}
                fill="none"
                stroke={color}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                initial={{ strokeDashoffset: reduce ? ringOffset : RING_C }}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.15 + index * 0.05, ease: EASE }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-h2 font-heading font-bold leading-none tracking-tight tabular-nums">
                {enabledPct}%
              </span>
              <span className="text-[10px] leading-none text-muted-foreground mt-1 tabular-nums">
                {env.enabledCount}/{env.totalFlags}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between text-caption">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                {t('overview.environments.evaluations')}
                <InfoTip text={t('overview.hints.evaluations')} />
              </span>
              <span className="font-semibold tabular-nums">{formatCompactCount(totalEval)}</span>
            </div>
            <div className="flex items-center justify-between text-caption">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                {t('overview.environments.rollouts')}
                <InfoTip text={t('overview.hints.rollouts')} />
              </span>
              <span
                className={`font-semibold tabular-nums ${env.rolloutCount > 0 ? 'text-brand' : ''}`}
              >
                {env.rolloutCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-caption">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                {t('overview.environments.stale')}
                <InfoTip text={t('overview.hints.stale')} />
              </span>
              <span
                className={`font-semibold tabular-nums ${env.staleCount > 0 ? 'text-warning' : ''}`}
              >
                {env.staleCount}
              </span>
            </div>
          </div>
        </div>

        {env.sdkSilent && (
          <div className="mt-3 pt-2.5 border-t border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-semibold text-warning bg-warning/10 border border-warning/20 cursor-help">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  {t('overview.environments.sdkSilent')}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] leading-snug">
                {t('overview.hints.sdkSilent')}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </Card>
  );
}

function DriftTable({
  t,
  rows,
  envRefs,
}: {
  t: TFn;
  rows: DriftRow[];
  envRefs: { id: number; name: string; color: string }[];
}) {
  const shown = rows.slice(0, DRIFT_LIMIT);
  const navigate = useNavigate();

  return (
    <Card>
      {rows.length === 0 ? (
        <div className="py-10 text-center text-body-sm text-muted-foreground">
          {t('overview.drift.empty')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-overline font-semibold text-muted-foreground">
                  {t('overview.drift.flag')}
                </th>
                {envRefs.map((env) => {
                  const c = env.color;
                  return (
                    <th key={env.id} className="text-left px-3 py-3">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-caption font-semibold"
                        style={{ backgroundColor: `${c}1f`, borderColor: `${c}33`, color: c }}
                      >
                        {env.name}
                      </span>
                    </th>
                  );
                })}
                <th className="text-left px-3 py-3 text-overline font-semibold text-muted-foreground">
                  {t('overview.drift.status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr
                  key={row.flagId}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-body-sm">{row.name}</div>
                    <div className="text-caption font-mono text-muted-foreground/70">
                      {row.flagKey}
                    </div>
                  </td>
                  {row.cells.map((cell) => (
                    <td key={cell.environmentId} className="px-3 py-3">
                      <DriftCellBadge t={t} cell={cell} />
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <DriftStatusLabel t={t} status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > DRIFT_LIMIT && (
            <div className="px-4 py-3 border-t border-border">
              <button
                type="button"
                onClick={() => navigate('/flags')}
                className="text-caption font-medium text-brand hover:underline"
              >
                {t('overview.drift.showAll', { count: String(rows.length) })}
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function DriftCellBadge({ t, cell }: { t: TFn; cell: DriftRow['cells'][number] }) {
  if (cell.state === 'rollout') {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-caption font-bold text-brand bg-brand/10 border border-brand/20 tabular-nums">
        {cell.percentage}%
      </span>
    );
  }
  if (cell.state === 'on') {
    return (
      <Badge variant="success" style="subtle" shape="pill" size="sm">
        {t('overview.drift.on')}
      </Badge>
    );
  }
  return (
    <Badge variant="default" style="subtle" shape="pill" size="sm">
      {t('overview.drift.off')}
    </Badge>
  );
}

function DriftStatusLabel({ t, status }: { t: TFn; status: DriftRow['status'] }) {
  const cls = status === 'rollout' ? 'text-brand' : 'text-warning';
  const label =
    status === 'rollout' ? t('overview.drift.statusRollout') : t('overview.drift.statusDrift');
  const hint =
    status === 'rollout' ? t('overview.hints.driftRollout') : t('overview.hints.driftDrift');
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1.5 text-caption font-semibold cursor-help ${cls}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[220px] leading-snug">
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

function ActivityFeed({ t, events }: { t: TFn; events: AuditEvent[] }) {
  const navigate = useNavigate();
  return (
    <Card className="h-full">
      <CardHeader
        title={t('overview.activity.title')}
        meta={
          <button
            type="button"
            onClick={() => navigate('/audit')}
            className="text-caption font-medium text-brand hover:underline focus-visible:outline-none focus-visible:underline"
          >
            {t('overview.activity.seeAll')}
          </button>
        }
      />
      <div className="px-2 pb-2">
        {events.length === 0 ? (
          <div className="py-10 text-center text-body-sm text-muted-foreground">
            {t('overview.activity.empty')}
          </div>
        ) : (
          events.map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="w-7 h-7 shrink-0">
                {e.userId ? (
                  <AvatarImage src={api.users.getAvatarUrl(e.userId)} alt={e.userName ?? ''} />
                ) : null}
                <AvatarFallback
                  className="text-caption font-semibold text-primary-foreground"
                  style={avatarStyle(e.userName || 'system')}
                >
                  {initials(e.userName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-body-sm">
                <div className="truncate">
                  <span className="font-semibold">{e.userName || 'system'}</span>{' '}
                  <span className="text-muted-foreground">
                    {getActionLabel(t, e.action)} · {getResourceLabel(t, e.resourceType)}
                  </span>
                </div>
                {e.resourceName && (
                  <div className="text-caption font-medium text-muted-foreground/80 mt-0.5 truncate">
                    {e.resourceName}
                  </div>
                )}
              </div>
              <span className="shrink-0 whitespace-nowrap text-caption text-muted-foreground/70 mt-0.5">
                {timeAgo(e.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

const AUDIT_ACTIONS = ['created', 'updated', 'deleted', 'archived', 'unarchived', 'purged'];
const AUDIT_RESOURCES = [
  'flag',
  'user',
  'tag',
  'apikey',
  'segment',
  'project',
  'environment',
  'context',
  'strategy',
  'integration',
];

function getActionLabel(t: TFn, action: string): string {
  const suffix = action.split('.').pop() ?? action;
  if (AUDIT_ACTIONS.includes(suffix)) return t(`audit.action.${suffix}` as MessageKey);
  return humanizeAction(action);
}

function getResourceLabel(t: TFn, type: string): string {
  if (AUDIT_RESOURCES.includes(type)) return t(`audit.resource.${type}` as MessageKey);
  return type;
}

function avatarStyle(name: string): React.CSSProperties {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return {
    background: `linear-gradient(135deg, oklch(0.6 0.15 ${hue}), oklch(0.48 0.14 ${hue}))`,
  };
}

function OnboardingChecklist({
  t,
  onboarding,
}: {
  t: TFn;
  onboarding: OverviewResponse['onboarding'];
}) {
  const reduce = useReducedMotion();
  const items: { key: keyof OverviewResponse['onboarding']; labelKey: MessageKey }[] = [
    { key: 'hasFlags', labelKey: 'overview.onboarding.hasFlags' },
    { key: 'hasEnvironments', labelKey: 'overview.onboarding.hasEnvironments' },
    { key: 'hasApiKey', labelKey: 'overview.onboarding.hasApiKey' },
    { key: 'hasConnectedSdk', labelKey: 'overview.onboarding.hasConnectedSdk' },
    { key: 'hasTeam', labelKey: 'overview.onboarding.hasTeam' },
  ];
  const done = items.filter((i) => onboarding[i.key]).length;
  const pct = Math.round((done / items.length) * 100);

  return (
    <Card className="h-full">
      <CardHeader
        title={t('overview.onboarding.title')}
        meta={t('overview.onboarding.progress', { done: String(done), total: String(items.length) })}
      />
      <div className="px-4">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gradient-start to-gradient-end"
            initial={{ width: reduce ? `${pct}%` : 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.15, ease: EASE }}
          />
        </div>
      </div>
      <div className="p-2">
        {items.map((item) => {
          const isDone = onboarding[item.key];
          return (
            <div key={item.key} className="flex items-center gap-2.5 px-2 py-2 text-body-sm">
              <span
                className={`w-[18px] h-[18px] rounded-md border shrink-0 grid place-items-center transition-colors ${
                  isDone ? 'bg-success border-success' : 'border-border'
                }`}
              >
                {isDone && <Check size={12} className="text-success-foreground" />}
              </span>
              <span className={isDone ? 'text-muted-foreground line-through' : 'text-foreground'}>
                {t(item.labelKey)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} padded>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16 mt-3" />
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="w-6 h-6 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="w-24 h-24 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-56" />
        <Card>
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function initials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function humanizeAction(action: string): string {
  return action.replace(/[._]/g, ' ');
}
