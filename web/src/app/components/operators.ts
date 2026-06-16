import { t } from '@/i18n';

export type OperatorDef = { value: string; label: string; multi?: boolean };

const STRING_OPERATORS: OperatorDef[] = [
  { value: 'eq', label: t('operators.eq') },
  { value: 'ne', label: t('operators.neq') },
  { value: 'in', label: t('operators.in'), multi: true },
  { value: 'not_in', label: t('operators.notIn'), multi: true },
  { value: 'contains', label: t('operators.contains') },
];

const COMPARABLE_OPERATORS: OperatorDef[] = [
  { value: 'eq', label: t('operators.eq') },
  { value: 'ne', label: t('operators.neq') },
  { value: 'gt', label: t('operators.gt') },
  { value: 'gte', label: t('operators.gte') },
  { value: 'lt', label: t('operators.lt') },
  { value: 'lte', label: t('operators.lte') },
];

export const OPERATORS_BY_TYPE: Record<string, OperatorDef[]> = {
  string: STRING_OPERATORS,
  number: COMPARABLE_OPERATORS,
  time: COMPARABLE_OPERATORS,
  semver: COMPARABLE_OPERATORS,
};

export const DEFAULT_OPERATOR_BY_TYPE: Record<string, string> = {
  string: 'in',
  number: 'eq',
  time: 'eq',
  semver: 'eq',
};

export const OPERATOR_LABELS: Record<string, string> = {
  eq: t('operators.eq'),
  ne: t('operators.neq'),
  in: t('operators.in'),
  not_in: t('operators.notIn'),
  gt: t('operators.gt'),
  gte: t('operators.gte'),
  lt: t('operators.lt'),
  lte: t('operators.lte'),
  contains: t('operators.contains'),
};

export const OPERATOR_COLORS: Record<string, string> = {
  in: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
  not_in: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
  eq: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  ne: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
  gt: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
  gte: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
  lt: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
  lte: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
  contains: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20',
};

export function getOperatorsForType(type: string | undefined): OperatorDef[] {
  return OPERATORS_BY_TYPE[type ?? 'string'] ?? STRING_OPERATORS;
}

export function getDefaultOperator(type: string | undefined): string {
  return DEFAULT_OPERATOR_BY_TYPE[type ?? 'string'] ?? 'in';
}

const OPERATOR_I18N_KEYS: Record<string, string> = {
  eq: 'operators.eq',
  ne: 'operators.neq',
  in: 'operators.in',
  not_in: 'operators.notIn',
  gt: 'operators.gt',
  gte: 'operators.gte',
  lt: 'operators.lt',
  lte: 'operators.lte',
  contains: 'operators.contains',
};

export function getOperatorI18nKey(op: string): string {
  return OPERATOR_I18N_KEYS[op] ?? op;
}

export function getOperatorShortCode(op: string): string {
  if (op === 'in') return 'IN';
  if (op === 'not_in') return 'NOT IN';
  if (op === 'contains') return 'CONTAINS';
  return op.toUpperCase();
}

export function isValidOperator(type: string | undefined, operator: string): boolean {
  const ops = getOperatorsForType(type);
  return ops.some(o => o.value === operator);
}

export function getInputMode(type: string | undefined): string {
  if (type === 'number') return 'decimal';
  if (type === 'semver') return 'numeric';
  return 'text';
}

export function getInputPlaceholder(type: string | undefined): string {
  switch (type) {
    case 'number': return '42';
    case 'time': return '2026-06-16T10:00:00';
    case 'semver': return '1.0.0';
    default: return '';
  }
}

export function getInputPattern(type: string | undefined): string | undefined {
  if (type === 'semver') return '^\\d+\\.\\d+\\.\\d+(-.*)?$';
  return undefined;
}

export function getInputHint(type: string | undefined): string {
  switch (type) {
    case 'number': return '42, 3.14, -10';
    case 'time': return '2026-06-16T10:00:00Z, 2026-07-01T00:00:00Z';
    case 'semver': return '1.0.0, 2.1.0-beta';
    default: return '';
  }
}

export function isConstraintValueValid(type: string | undefined, value: string, operator: string): boolean {
  if (type === 'string' || !type) return true;
  if (operator === 'in' || operator === 'not_in') return true;
  if (!value) return true;
  if (type === 'number') return !isNaN(Number(value));
  if (type === 'time') return /(^\d{2}:\d{2}$)|(^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$)/.test(value);
  if (type === 'semver') return /^\d+\.\d+\.\d+(-.*)?$/.test(value);
  return true;
}

export function getInlineValidationError(type: string | undefined, value: string): string {
  if (!value) return '';
  if (type === 'number' && isNaN(Number(value))) return 'invalid';
  if (type === 'semver' && !/^\d+\.\d+\.\d+(-.*)?$/.test(value)) return 'invalid';
  return '';
}
