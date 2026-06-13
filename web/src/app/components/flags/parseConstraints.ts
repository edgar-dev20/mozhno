import type { ConstraintEntry } from "@/app/components/flags/types";
import type { ContextDefinition } from "@/api";
import { isValidOperator, getDefaultOperator } from "@/app/components/operators";

export function parseConstraintEntries(
  contextValuesJson: string | null,
  contextDefinitionId: number | null,
  contexts: ContextDefinition[],
): ConstraintEntry[] {
  if (!contextValuesJson) return [];
  try {
    const parsed: { cd?: number; op?: string; val?: string; value?: string; contextDefId?: number }[] = JSON.parse(contextValuesJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      let cdId: number;
      let op: string;
      let val: string;
      if (typeof item === 'object' && item !== null && 'op' in item) {
        cdId = item.contextDefId ?? contextDefinitionId ?? 0;
        op = item.op ?? 'eq';
        val = item.val ?? String(item.value ?? '');
      } else {
        cdId = contextDefinitionId ?? 0;
        op = 'in';
        val = String(item);
      }
      const ctx = contexts.find(x => x.id === cdId);
      return {
        contextDefId: cdId,
        operator: isValidOperator(ctx?.type, op) ? op : getDefaultOperator(ctx?.type),
        value: val,
      };
    });
  } catch {
    return [];
  }
}
