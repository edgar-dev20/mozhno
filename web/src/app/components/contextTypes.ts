export const ContextType = {
  STRING: 'string',
  NUMBER: 'number',
  TIME: 'time',
  SEMVER: 'semver',
} as const;

export type ContextTypeValue = (typeof ContextType)[keyof typeof ContextType];

export const CONTEXT_TYPES: readonly ContextTypeValue[] = [
  ContextType.STRING,
  ContextType.NUMBER,
  ContextType.TIME,
  ContextType.SEMVER,
] as const;
