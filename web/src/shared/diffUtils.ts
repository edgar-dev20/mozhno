import type { ReactNode } from 'react';

export interface DiffChange {
  field: string;
  label: string;
  before: string | ReactNode;
  after: string | ReactNode;
  icon?: ReactNode;
  group?: string;
}

export function computeDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  labels: Record<string, string>,
): DiffChange[] {
  const changes: DiffChange[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const bVal = before[key];
    const aVal = after[key];

    const bStr = typeof bVal === 'object' ? JSON.stringify(bVal) : String(bVal ?? '');
    const aStr = typeof aVal === 'object' ? JSON.stringify(aVal) : String(aVal ?? '');

    if (bStr !== aStr) {
      changes.push({
        field: key,
        label: labels[key] ?? key,
        before: bStr,
        after: aStr,
      });
    }
  }

  return changes;
}
