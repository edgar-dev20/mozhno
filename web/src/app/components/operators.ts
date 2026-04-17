import { t } from '@/i18n';

export type OperatorDef = { value: string; label: string };

const STRING_OPERATORS: OperatorDef[] = [
  { value: 'eq', label: t('operators.eq') },
  { value: 'ne', label: t('operators.neq') },
  { value: 'in', label: t('operators.in') },
  { value: 'not_in', label: t('operators.notIn') },
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

export function getOperatorsForType(type: string | undefined): OperatorDef[] {
  return OPERATORS_BY_TYPE[type ?? 'string'] ?? STRING_OPERATORS;
}

export function getDefaultOperator(type: string | undefined): string {
  return DEFAULT_OPERATOR_BY_TYPE[type ?? 'string'] ?? 'in';
}

export function isValidOperator(type: string | undefined, operator: string): boolean {
  const ops = getOperatorsForType(type);
  return ops.some(o => o.value === operator);
}
