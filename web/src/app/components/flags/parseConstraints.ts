import type { ConstraintEntry } from '@/app/components/flags/types';
import type { ContextDefinition } from '@/api';
import { isValidOperator, getDefaultOperator } from '@/app/components/operators';
import { Operator } from '@/app/components/operatorsMeta';

export {
  groupConstraintEntries,
  flattenConstraintGroups,
} from '@/app/components/flags/groupConstraints';

export function parseConstraintEntries(
  contextValuesJson: string | null,
  contextDefinitionId: number | null,
  contexts: ContextDefinition[],
): ConstraintEntry[] {
  if (!contextValuesJson) return [];
  try {
    const parsed: {
      cd?: number;
      op?: string;
      val?: string;
      value?: string;
      contextDefId?: number;
    }[] = JSON.parse(contextValuesJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      let cdId: number;
      let op: string;
      let val: string;
      if (typeof item === 'object' && item !== null && 'op' in item) {
        cdId = item.cd ?? item.contextDefId ?? contextDefinitionId ?? 0;
        op = item.op ?? Operator.EQ;
        val = item.val ?? String(item.value ?? '');
      } else {
        cdId = contextDefinitionId ?? 0;
        op = Operator.IN;
        val = String(item);
      }
      const ctx = Array.isArray(contexts) ? contexts.find((x) => x.id === cdId) : undefined;
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
