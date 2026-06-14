import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ValidationError, validateResponse, createValidatedRequest } from '@/api/validation';

const testSchema = z.object({
  id: z.number(),
  name: z.string(),
});

describe('ValidationError', () => {
  it('has correct message and issues array', () => {
    const result = testSchema.safeParse({});
    expect(result.success).toBe(false);

    const error = new ValidationError(result.error!.issues);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ValidationError');
    expect(error.message).toContain('API schema validation failed');
    expect(error.issues).toEqual(result.error!.issues);
    expect(error.issues.length).toBeGreaterThan(0);
  });
});

describe('validateResponse', () => {
  it('returns parsed data for valid input', () => {
    const data = { id: 1, name: 'test' };
    const result = validateResponse(testSchema, data);
    expect(result).toEqual(data);
  });

  it('throws ValidationError for invalid input', () => {
    expect(() => validateResponse(testSchema, { id: 'not-a-number' })).toThrow(ValidationError);
  });

  it('throws ValidationError with issues for missing required field', () => {
    try {
      validateResponse(testSchema, { name: 'missing id' });
      expect.unreachable('Expected ValidationError to be thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).issues.length).toBeGreaterThan(0);
    }
  });
});

describe('createValidatedRequest', () => {
  it('returns a function that validates successfully', () => {
    const validatedFn = createValidatedRequest(testSchema);
    const data = { id: 2, name: 'hello' };
    const result = validatedFn(data);
    expect(result).toEqual(data);
  });

  it('returned function throws ValidationError for invalid input', () => {
    const validatedFn = createValidatedRequest(testSchema);
    expect(() => validatedFn({})).toThrow(ValidationError);
  });

  it('returned function throws ValidationError with correct issues', () => {
    const validatedFn = createValidatedRequest(testSchema);
    try {
      validatedFn({ id: 1 });
      expect.unreachable('Expected ValidationError to be thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError);
      expect((e as ValidationError).issues.length).toBeGreaterThan(0);
    }
  });
});
