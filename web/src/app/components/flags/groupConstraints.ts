import type { ConstraintEntry, ConstraintGroup } from "@/app/components/flags/types";

function nextId(): string {
  return `cg_${Math.random().toString(36).slice(2, 7)}_${Math.random().toString(36).slice(2, 5)}`;
}

export function groupConstraintEntries(
  entries: ConstraintEntry[],
): ConstraintGroup[] {
  const map = new Map<string, string[]>();
  const order: { key: string; contextDefId: number; operator: string }[] = [];

  for (const e of entries) {
    const key = `${e.contextDefId}|${e.operator}`;
    if (!map.has(key)) {
      map.set(key, []);
      order.push({ key, contextDefId: e.contextDefId, operator: e.operator });
    }
    const vals = map.get(key)!;
    if (!vals.includes(e.value)) {
      vals.push(e.value);
    }
  }

  return order.map((o) => ({
    id: nextId(),
    contextDefId: o.contextDefId,
    operator: o.operator,
    values: map.get(o.key) ?? [],
  }));
}

export function flattenConstraintGroups(
  groups: ConstraintGroup[],
): ConstraintEntry[] {
  const result: ConstraintEntry[] = [];
  for (const g of groups) {
    for (const val of g.values) {
      result.push({ contextDefId: g.contextDefId, operator: g.operator, value: val });
    }
  }
  return result;
}
