import { z } from 'zod';

type Schema<T> = z.ZodType<T>;

export class ValidationError extends Error {
  readonly issues: z.ZodIssue[];

  constructor(issues: z.ZodIssue[]) {
    super(`API schema validation failed: ${issues.map((i) => i.message).join(', ')}`);
    this.name = 'ValidationError';
    this.issues = issues;
  }
}

export function validateResponse<T>(schema: Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  return result.data;
}

export function createValidatedRequest<T>(schema: Schema<T>) {
  return (data: unknown): T => validateResponse(schema, data);
}
