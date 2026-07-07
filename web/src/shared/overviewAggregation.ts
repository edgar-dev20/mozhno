import type { FlagView } from '@/app/hooks/flagTypes';

export type EnvCellState = 'on' | 'off' | 'rollout' | 'absent';

export type DriftStatus = 'synced' | 'drift' | 'rollout';

export interface DriftCell {
  environmentId: number;
  state: EnvCellState;
  percentage: number | null;
}

export interface DriftRow {
  flagId: number;
  name: string;
  flagKey: string;
  flagType: string;
  cells: DriftCell[];
  status: DriftStatus;
}

export interface EnvRef {
  id: number;
  name: string;
}

function cellState(flag: FlagView, envId: number): { state: EnvCellState; percentage: number | null } {
  const env = flag.environments[envId];
  if (!env) return { state: 'absent', percentage: null };
  if (!env.enabled) return { state: 'off', percentage: null };
  const pct = env.percentage;
  if (pct != null && pct > 0 && pct < 100) return { state: 'rollout', percentage: pct };
  return { state: 'on', percentage: null };
}

/**
 * Computes cross-environment drift for the given flags. A flag is "drifting" when
 * its enabled state differs between environments; "rollout" when any environment is
 * on a partial percentage. Fully-consistent flags are omitted. No environment is
 * treated as the canonical one — all are compared equally.
 */
export function computeDrift(flags: FlagView[], environments: EnvRef[]): DriftRow[] {
  if (environments.length < 1) return [];

  const rows: DriftRow[] = [];

  for (const flag of flags) {
    if (flag.archived) continue;

    const cells: DriftCell[] = environments.map((env) => {
      const { state, percentage } = cellState(flag, env.id);
      return { environmentId: env.id, state, percentage };
    });

    const hasRollout = cells.some((c) => c.state === 'rollout');
    // Normalize enabled vs disabled ("absent" counts as disabled) to detect divergence.
    const enabledFlags = new Set(cells.map((c) => c.state === 'on' || c.state === 'rollout'));
    const diverges = enabledFlags.size > 1;

    let status: DriftStatus;
    if (hasRollout) status = 'rollout';
    else if (diverges) status = 'drift';
    else status = 'synced';

    if (status === 'synced') continue;

    rows.push({
      flagId: flag.flagId,
      name: flag.name,
      flagKey: flag.key,
      flagType: flag.flagType,
      cells,
      status,
    });
  }

  return rows;
}
