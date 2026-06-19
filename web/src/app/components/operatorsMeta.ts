export const Operator = {
  IN: 'in',
  NOT_IN: 'not_in',
  EQ: 'eq',
  NE: 'ne',
  GT: 'gt',
  GTE: 'gte',
  LT: 'lt',
  LTE: 'lte',
  CONTAINS: 'contains',
} as const;

export type OperatorValue = (typeof Operator)[keyof typeof Operator];

export function isMultiOperator(op: string): boolean {
  return op === Operator.IN || op === Operator.NOT_IN;
}
