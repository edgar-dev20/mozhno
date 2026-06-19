import { describe, it, expect } from 'vitest';
import { isFlagEnabled } from '../src/evaluation/evaluator';
import type { FeatureFlag, MozhnoContext } from '../src/types';

function createFlag(
  overrides: Partial<FeatureFlag> & { constraints?: FeatureFlag['activation']['constraints']; rollOut?: number } = {}
): FeatureFlag {
  return {
    name: 'test',
    key: 'test',
    enabled: true,
    activation: {
      constraints: overrides.constraints || [],
      rollOut: overrides.rollOut,
    },
    ...overrides,
  } as FeatureFlag;
}

describe('Evaluator', () => {
  it('simple flag enabled no activation', () => {
    expect(isFlagEnabled({ name: 'f', key: 'f', enabled: true }, {})).toBe(true);
  });

  it('simple flag disabled', () => {
    expect(isFlagEnabled({ name: 'f', key: 'f', enabled: false }, {})).toBe(false);
  });

  it('constraint in matches', () => {
    const flag = createFlag({
      constraints: [{ field: 'country', operator: 'in', values: ['RU', 'KZ'] }],
    });
    expect(isFlagEnabled(flag, { country: 'RU' })).toBe(true);
  });

  it('constraint in does not match', () => {
    const flag = createFlag({
      constraints: [{ field: 'country', operator: 'in', values: ['RU', 'KZ'] }],
    });
    expect(isFlagEnabled(flag, { country: 'US' })).toBe(false);
  });

  it('constraint not_in matches', () => {
    const flag = createFlag({
      constraints: [{ field: 'country', operator: 'not_in', values: ['RU', 'KZ'] }],
    });
    expect(isFlagEnabled(flag, { country: 'US' })).toBe(true);
  });

  it('constraint missing field', () => {
    const flag = createFlag({
      constraints: [{ field: 'country', operator: 'in', values: ['RU'] }],
    });
    expect(isFlagEnabled(flag, {})).toBe(false);
  });

  it('constraint eq matches string', () => {
    const flag = createFlag({
      constraints: [{ field: 'plan', operator: 'eq', values: ['premium'] }],
    });
    expect(isFlagEnabled(flag, { plan: 'premium' })).toBe(true);
  });

  it('constraint eq does not match string', () => {
    const flag = createFlag({
      constraints: [{ field: 'plan', operator: 'eq', values: ['premium'] }],
    });
    expect(isFlagEnabled(flag, { plan: 'basic' })).toBe(false);
  });

  it('constraint ne matches', () => {
    const flag = createFlag({
      constraints: [{ field: 'plan', operator: 'ne', values: ['premium'] }],
    });
    expect(isFlagEnabled(flag, { plan: 'basic' })).toBe(true);
  });

  it('constraint ne does not match', () => {
    const flag = createFlag({
      constraints: [{ field: 'plan', operator: 'ne', values: ['premium'] }],
    });
    expect(isFlagEnabled(flag, { plan: 'premium' })).toBe(false);
  });

  it('constraint eq matches number with contextType', () => {
    const flag = createFlag({
      constraints: [{ field: 'age', operator: 'eq', values: ['25'], contextType: 'number' }],
    });
    expect(isFlagEnabled(flag, { age: '25' })).toBe(true);
  });

  it('constraint eq does not match number', () => {
    const flag = createFlag({
      constraints: [{ field: 'age', operator: 'eq', values: ['25'], contextType: 'number' }],
    });
    expect(isFlagEnabled(flag, { age: '30' })).toBe(false);
  });

  it('constraint gt number', () => {
    const flag = createFlag({
      constraints: [{ field: 'age', operator: 'gt', values: ['18'], contextType: 'number' }],
    });
    expect(isFlagEnabled(flag, { age: '25' })).toBe(true);
    expect(isFlagEnabled(flag, { age: '18' })).toBe(false);
    expect(isFlagEnabled(flag, { age: '10' })).toBe(false);
  });

  it('constraint gte number', () => {
    const flag = createFlag({
      constraints: [{ field: 'age', operator: 'gte', values: ['18'], contextType: 'number' }],
    });
    expect(isFlagEnabled(flag, { age: '25' })).toBe(true);
    expect(isFlagEnabled(flag, { age: '18' })).toBe(true);
  });

  it('constraint lt number', () => {
    const flag = createFlag({
      constraints: [{ field: 'age', operator: 'lt', values: ['65'], contextType: 'number' }],
    });
    expect(isFlagEnabled(flag, { age: '30' })).toBe(true);
    expect(isFlagEnabled(flag, { age: '65' })).toBe(false);
  });

  it('constraint lte number', () => {
    const flag = createFlag({
      constraints: [{ field: 'age', operator: 'lte', values: ['65'], contextType: 'number' }],
    });
    expect(isFlagEnabled(flag, { age: '30' })).toBe(true);
    expect(isFlagEnabled(flag, { age: '65' })).toBe(true);
  });

  it('constraint contains string', () => {
    const flag = createFlag({
      constraints: [{ field: 'email', operator: 'contains', values: ['@company.com'] }],
    });
    expect(isFlagEnabled(flag, { email: 'user@company.com' })).toBe(true);
    expect(isFlagEnabled(flag, { email: 'user@gmail.com' })).toBe(false);
  });

  it('constraint gt semver', () => {
    const flag = createFlag({
      constraints: [{ field: 'version', operator: 'gt', values: ['1.0.0'], contextType: 'semver' }],
    });
    expect(isFlagEnabled(flag, { version: '2.0.0' })).toBe(true);
    expect(isFlagEnabled(flag, { version: '0.9.0' })).toBe(false);
    expect(isFlagEnabled(flag, { version: '1.0.0' })).toBe(false);
  });

  it('constraint gte semver', () => {
    const flag = createFlag({
      constraints: [{ field: 'version', operator: 'gte', values: ['1.0.0'], contextType: 'semver' }],
    });
    expect(isFlagEnabled(flag, { version: '1.0.0' })).toBe(true);
    expect(isFlagEnabled(flag, { version: '1.0.1' })).toBe(true);
  });

  it('constraint gt time', () => {
    const flag = createFlag({
      constraints: [{ field: 'createdAt', operator: 'gt', values: ['2024-01-01T00:00:00Z'], contextType: 'time' }],
    });
    expect(isFlagEnabled(flag, { createdAt: '2025-01-01T00:00:00Z' })).toBe(true);
    expect(isFlagEnabled(flag, { createdAt: '2023-01-01T00:00:00Z' })).toBe(false);
  });

  it('multiple constraints all must match', () => {
    const flag = createFlag({
      constraints: [
        { field: 'country', operator: 'in', values: ['RU', 'KZ'] },
        { field: 'age', operator: 'gte', values: ['18'], contextType: 'number' },
      ],
    });
    expect(isFlagEnabled(flag, { country: 'RU', age: '25' })).toBe(true);
    expect(isFlagEnabled(flag, { country: 'RU', age: '10' })).toBe(false);
  });

  it('percentage rollout 100', () => {
    const flag = createFlag({ rollOut: 100 });
    expect(isFlagEnabled(flag, { userId: 'any' })).toBe(true);
  });

  it('percentage rollout 0', () => {
    const flag = createFlag({ rollOut: 0 });
    expect(isFlagEnabled(flag, { userId: 'any' })).toBe(false);
  });

  it('percentage rollout deterministic', () => {
    const flag = createFlag({ rollOut: 50 });
    const first = isFlagEnabled(flag, { userId: 'test-user' });
    const second = isFlagEnabled(flag, { userId: 'test-user' });
    expect(first).toBe(second);
  });

  it('segments OR any match', () => {
    const flag: FeatureFlag = {
      name: 'test',
      key: 'test',
      enabled: true,
      activation: {
        segments: [
          { constraints: [{ field: 'country', operator: 'in', values: ['RU', 'KZ'] }] },
          { constraints: [{ field: 'country', operator: 'in', values: ['US'] }] },
        ],
      },
    };
    expect(isFlagEnabled(flag, { country: 'RU' })).toBe(true);
    expect(isFlagEnabled(flag, { country: 'US' })).toBe(true);
    expect(isFlagEnabled(flag, { country: 'CN' })).toBe(false);
  });

  it('segments OR different fields', () => {
    const flag: FeatureFlag = {
      name: 'test',
      key: 'test',
      enabled: true,
      activation: {
        segments: [
          { constraints: [{ field: 'country', operator: 'eq', values: ['RU'] }] },
          { constraints: [{ field: 'plan', operator: 'eq', values: ['premium'] }] },
        ],
      },
    };
    expect(isFlagEnabled(flag, { country: 'RU' })).toBe(true);
    expect(isFlagEnabled(flag, { plan: 'premium' })).toBe(true);
    expect(isFlagEnabled(flag, { country: 'US' })).toBe(false);
  });

  it('segments AND constraints both required', () => {
    const flag: FeatureFlag = {
      name: 'test',
      key: 'test',
      enabled: true,
      activation: {
        constraints: [{ field: 'plan', operator: 'eq', values: ['premium'] }],
        segments: [
          { constraints: [{ field: 'country', operator: 'eq', values: ['RU'] }] },
        ],
      },
    };
    expect(isFlagEnabled(flag, { plan: 'premium', country: 'RU' })).toBe(true);
    expect(isFlagEnabled(flag, { plan: 'premium', country: 'US' })).toBe(false);
    expect(isFlagEnabled(flag, { plan: 'basic', country: 'RU' })).toBe(false);
  });

  it('empty segments pass', () => {
    const flag: FeatureFlag = {
      name: 'test',
      key: 'test',
      enabled: true,
      activation: { segments: [] },
    };
    expect(isFlagEnabled(flag, {})).toBe(true);
  });

  it('segment with empty constraints passes', () => {
    const flag: FeatureFlag = {
      name: 'test',
      key: 'test',
      enabled: true,
      activation: {
        segments: [{ constraints: [] }],
      },
    };
    expect(isFlagEnabled(flag, {})).toBe(true);
  });
});
