import { t } from '@/i18n';
import { ContextType } from '@/app/components/contextTypes';
import { Operator, isMultiOperator } from '@/app/components/operatorsMeta';

export type OperatorDef = { value: string; label: string; multi?: boolean };

const STRING_OPERATORS: OperatorDef[] = [
  { value: Operator.EQ, label: t('operators.eq') },
  { value: Operator.NE, label: t('operators.neq') },
  { value: Operator.IN, label: t('operators.in'), multi: true },
  { value: Operator.NOT_IN, label: t('operators.notIn'), multi: true },
  { value: Operator.CONTAINS, label: t('operators.contains') },
];

const COMPARABLE_OPERATORS: OperatorDef[] = [
  { value: Operator.EQ, label: t('operators.eq') },
  { value: Operator.NE, label: t('operators.neq') },
  { value: Operator.GT, label: t('operators.gt') },
  { value: Operator.GTE, label: t('operators.gte') },
  { value: Operator.LT, label: t('operators.lt') },
  { value: Operator.LTE, label: t('operators.lte') },
];

const TIME_OPERATORS: OperatorDef[] = [
  { value: Operator.GT, label: t('operators.after') },
  { value: Operator.LT, label: t('operators.before') },
];

export const OPERATORS_BY_TYPE: Record<string, OperatorDef[]> = {
  [ContextType.STRING]: STRING_OPERATORS,
  [ContextType.NUMBER]: COMPARABLE_OPERATORS,
  [ContextType.TIME]: TIME_OPERATORS,
  [ContextType.SEMVER]: COMPARABLE_OPERATORS,
};

export const DEFAULT_OPERATOR_BY_TYPE: Record<string, string> = {
  [ContextType.STRING]: Operator.IN,
  [ContextType.NUMBER]: Operator.EQ,
  [ContextType.TIME]: Operator.GT,
  [ContextType.SEMVER]: Operator.EQ,
};

export const OPERATOR_LABELS: Record<string, string> = {
  [Operator.EQ]: t('operators.eq'),
  [Operator.NE]: t('operators.neq'),
  [Operator.IN]: t('operators.in'),
  [Operator.NOT_IN]: t('operators.notIn'),
  [Operator.GT]: t('operators.gt'),
  [Operator.GTE]: t('operators.gte'),
  [Operator.LT]: t('operators.lt'),
  [Operator.LTE]: t('operators.lte'),
  [Operator.CONTAINS]: t('operators.contains'),
  after: t('operators.after'),
  before: t('operators.before'),
};

export const OPERATOR_COLORS: Record<string, string> = {
  [Operator.IN]: 'text-brand dark:text-brand bg-brand/10 border-brand/20',
  [Operator.NOT_IN]:
    'text-brand dark:text-brand bg-brand/10 border-brand/20',
  [Operator.EQ]: 'text-success dark:text-success bg-success/10 border-success/20',
  [Operator.NE]: 'text-brand dark:text-brand bg-brand/10 border-brand/20',
  [Operator.GT]: 'text-warning dark:text-warning bg-warning/10 border-warning/20',
  [Operator.GTE]: 'text-warning dark:text-warning bg-warning/10 border-warning/20',
  [Operator.LT]: 'text-warning dark:text-warning bg-warning/10 border-warning/20',
  [Operator.LTE]: 'text-warning dark:text-warning bg-warning/10 border-warning/20',
  [Operator.CONTAINS]:
    'text-brand dark:text-brand bg-brand/10 border-brand/20',
  after:
    'text-warning dark:text-warning bg-warning/10 border-warning/20',
  before:
    'text-warning dark:text-warning bg-warning/10 border-warning/20',
};

export function getOperatorsForType(type: string | undefined): OperatorDef[] {
  return OPERATORS_BY_TYPE[type ?? ContextType.STRING] ?? STRING_OPERATORS;
}

export function getDefaultOperator(type: string | undefined): string {
  return DEFAULT_OPERATOR_BY_TYPE[type ?? ContextType.STRING] ?? Operator.IN;
}

const OPERATOR_I18N_KEYS: Record<string, string> = {
  [Operator.EQ]: 'operators.eq',
  [Operator.NE]: 'operators.neq',
  [Operator.IN]: 'operators.in',
  [Operator.NOT_IN]: 'operators.notIn',
  [Operator.GT]: 'operators.gt',
  [Operator.GTE]: 'operators.gte',
  [Operator.LT]: 'operators.lt',
  [Operator.LTE]: 'operators.lte',
  [Operator.CONTAINS]: 'operators.contains',
};

const TIME_OPERATOR_I18N_KEYS: Record<string, string> = {
  [Operator.GT]: 'operators.after',
  [Operator.LT]: 'operators.before',
};

export function getOperatorI18nKey(op: string, contextType?: string): string {
  if (contextType === ContextType.TIME && TIME_OPERATOR_I18N_KEYS[op]) {
    return TIME_OPERATOR_I18N_KEYS[op];
  }
  return OPERATOR_I18N_KEYS[op] ?? op;
}

export function getOperatorShortCode(op: string, contextType?: string): string {
  if (op === Operator.IN) return 'IN';
  if (op === Operator.NOT_IN) return 'NOT IN';
  if (op === Operator.CONTAINS) return 'CONTAINS';
  if (contextType === ContextType.TIME) {
    if (op === Operator.GT) return 'AFTER';
    if (op === Operator.LT) return 'BEFORE';
  }
  return op.toUpperCase();
}

export function isValidOperator(type: string | undefined, operator: string): boolean {
  const ops = getOperatorsForType(type);
  return ops.some((o) => o.value === operator);
}

export function getInputMode(type: string | undefined): string {
  if (type === ContextType.NUMBER) return 'decimal';
  if (type === ContextType.SEMVER) return 'numeric';
  return 'text';
}

export function getInputPlaceholder(type: string | undefined): string {
  switch (type) {
    case ContextType.NUMBER:
      return '42';
    case ContextType.TIME:
      return '2026-06-16T10:00:00';
    case ContextType.SEMVER:
      return '1.0.0';
    default:
      return '';
  }
}

export function getInputPattern(type: string | undefined): string | undefined {
  if (type === ContextType.SEMVER) return '^\\d+\\.\\d+\\.\\d+(-.*)?$';
  return undefined;
}

export function getInputHint(type: string | undefined): string {
  switch (type) {
    case ContextType.NUMBER:
      return '42, 3.14, -10';
    case ContextType.TIME:
      return '2026-06-16T10:00:00Z, 2026-07-01T00:00:00Z';
    case ContextType.SEMVER:
      return '1.0.0, 2.1.0-beta';
    default:
      return '';
  }
}

export function isConstraintValueValid(
  type: string | undefined,
  value: string,
  operator: string,
): boolean {
  if (type === ContextType.STRING || !type) return true;
  if (isMultiOperator(operator)) return true;
  if (!value) return true;
  if (type === ContextType.NUMBER) return !isNaN(Number(value));
  if (type === ContextType.TIME)
    return /(^\d{2}:\d{2}$)|(^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$)/.test(
      value,
    );
  if (type === ContextType.SEMVER) return /^\d+\.\d+\.\d+(-.*)?$/.test(value);
  return true;
}

export function getInlineValidationError(type: string | undefined, value: string): string {
  if (!value) return '';
  if (type === ContextType.NUMBER && isNaN(Number(value))) return 'invalid';
  if (type === ContextType.SEMVER && !/^\d+\.\d+\.\d+(-.*)?$/.test(value)) return 'invalid';
  return '';
}
