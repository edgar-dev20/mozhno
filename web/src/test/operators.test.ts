import { describe, it, expect } from 'vitest';
import {
  OPERATORS_BY_TYPE,
  DEFAULT_OPERATOR_BY_TYPE,
  OPERATOR_LABELS,
  OPERATOR_COLORS,
  getOperatorsForType,
  getDefaultOperator,
  isValidOperator,
} from '@/app/components/operators';
import { Operator, isMultiOperator } from '@/app/components/operatorsMeta';
import { ContextType } from '@/app/components/contextTypes';

describe('operators constants', () => {
  it('OPERATORS_BY_TYPE has all context type keys', () => {
    const keys = Object.keys(OPERATORS_BY_TYPE);
    expect(keys).toContain(ContextType.STRING);
    expect(keys).toContain(ContextType.NUMBER);
    expect(keys).toContain(ContextType.TIME);
    expect(keys).toContain(ContextType.SEMVER);
  });

  it('OPERATOR_LABELS uses Operator keys', () => {
    const keys = Object.keys(OPERATOR_LABELS);
    expect(keys).toContain(Operator.EQ);
    expect(keys).toContain(Operator.NE);
    expect(keys).toContain(Operator.IN);
    expect(keys).toContain(Operator.NOT_IN);
    expect(keys).toContain(Operator.GT);
    expect(keys).toContain(Operator.GTE);
    expect(keys).toContain(Operator.LT);
    expect(keys).toContain(Operator.LTE);
    expect(keys).toContain(Operator.CONTAINS);
  });

  it('OPERATOR_COLORS uses Operator keys', () => {
    const keys = Object.keys(OPERATOR_COLORS);
    expect(keys).toContain(Operator.EQ);
    expect(keys).toContain(Operator.IN);
    expect(keys).toContain(Operator.NOT_IN);
    expect(keys).toContain(Operator.CONTAINS);
  });
});

describe('getOperatorsForType', () => {
  it('returns STRING_OPERATORS for string type', () => {
    const ops = getOperatorsForType(ContextType.STRING);
    const values = ops.map((o) => o.value);
    expect(values).toContain(Operator.IN);
    expect(values).toContain(Operator.CONTAINS);
    expect(values).toContain(Operator.EQ);
    expect(values).toContain(Operator.NE);
    expect(values).toContain(Operator.NOT_IN);
  });

  it('returns COMPARABLE_OPERATORS for number type', () => {
    const ops = getOperatorsForType(ContextType.NUMBER);
    const values = ops.map((o) => o.value);
    expect(values).toContain(Operator.GT);
    expect(values).toContain(Operator.LT);
    expect(values).toContain(Operator.EQ);
    expect(values).not.toContain(Operator.CONTAINS);
  });

  it('defaults to string operators with undefined type', () => {
    const ops = getOperatorsForType(undefined);
    const values = ops.map((o) => o.value);
    expect(values).toContain(Operator.IN);
    expect(values).toContain(Operator.CONTAINS);
  });
});

describe('getDefaultOperator', () => {
  it('returns IN for string', () => {
    expect(getDefaultOperator(ContextType.STRING)).toBe(Operator.IN);
  });

  it('returns EQ for number', () => {
    expect(getDefaultOperator(ContextType.NUMBER)).toBe(Operator.EQ);
  });
});

describe('isValidOperator', () => {
  it('returns true for valid operator and type (number + gt)', () => {
    expect(isValidOperator(ContextType.NUMBER, Operator.GT)).toBe(true);
  });

  it('returns true for valid operator and type (string + contains)', () => {
    expect(isValidOperator(ContextType.STRING, Operator.CONTAINS)).toBe(true);
  });

  it('returns false for invalid combo (number + contains)', () => {
    expect(isValidOperator(ContextType.NUMBER, Operator.CONTAINS)).toBe(false);
  });

  it('returns false for completely bogus operator', () => {
    expect(isValidOperator(ContextType.NUMBER, 'bogus')).toBe(false);
  });
});

describe('isMultiOperator', () => {
  it('returns true for IN and NOT_IN', () => {
    expect(isMultiOperator(Operator.IN)).toBe(true);
    expect(isMultiOperator(Operator.NOT_IN)).toBe(true);
  });

  it('returns false for single-value operators', () => {
    expect(isMultiOperator(Operator.EQ)).toBe(false);
    expect(isMultiOperator(Operator.NE)).toBe(false);
    expect(isMultiOperator(Operator.GT)).toBe(false);
    expect(isMultiOperator(Operator.LT)).toBe(false);
    expect(isMultiOperator(Operator.CONTAINS)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isMultiOperator('')).toBe(false);
  });
});
