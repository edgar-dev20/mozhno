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

describe('operators constants', () => {
  it('OPERATORS_BY_TYPE has string, number, time, semver keys', () => {
    const keys = Object.keys(OPERATORS_BY_TYPE);
    expect(keys).toContain('string');
    expect(keys).toContain('number');
    expect(keys).toContain('time');
    expect(keys).toContain('semver');
  });

  it('OPERATOR_LABELS has all expected keys', () => {
    const keys = Object.keys(OPERATOR_LABELS);
    ['eq', 'ne', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'contains'].forEach((k) => {
      expect(keys).toContain(k);
    });
  });

  it('OPERATOR_COLORS has all expected keys', () => {
    const keys = Object.keys(OPERATOR_COLORS);
    ['eq', 'ne', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'contains'].forEach((k) => {
      expect(keys).toContain(k);
    });
  });
});

describe('getOperatorsForType', () => {
  it("returns STRING_OPERATORS for 'string'", () => {
    const ops = getOperatorsForType('string');
    const values = ops.map((o) => o.value);
    expect(values).toContain('in');
    expect(values).toContain('contains');
    expect(values).toContain('eq');
    expect(values).toContain('ne');
    expect(values).toContain('not_in');
  });

  it("returns COMPARABLE_OPERATORS for 'number'", () => {
    const ops = getOperatorsForType('number');
    const values = ops.map((o) => o.value);
    expect(values).toContain('gt');
    expect(values).toContain('lt');
    expect(values).toContain('eq');
    expect(values).not.toContain('contains');
  });

  it('defaults to string operators with undefined type', () => {
    const ops = getOperatorsForType(undefined);
    const values = ops.map((o) => o.value);
    expect(values).toContain('in');
    expect(values).toContain('contains');
  });
});

describe('getDefaultOperator', () => {
  it("returns 'in' for string", () => {
    expect(getDefaultOperator('string')).toBe('in');
  });

  it("returns 'eq' for number", () => {
    expect(getDefaultOperator('number')).toBe('eq');
  });
});

describe('isValidOperator', () => {
  it("returns true for valid operator and type ('number' + 'gt')", () => {
    expect(isValidOperator('number', 'gt')).toBe(true);
  });

  it("returns true for valid operator and type ('string' + 'contains')", () => {
    expect(isValidOperator('string', 'contains')).toBe(true);
  });

  it("returns false for invalid combo ('number' + 'contains')", () => {
    expect(isValidOperator('number', 'contains')).toBe(false);
  });

  it('returns false for completely bogus operator', () => {
    expect(isValidOperator('number', 'bogus')).toBe(false);
  });
});
