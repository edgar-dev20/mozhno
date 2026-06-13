export type ErrorCode =
  | 'NETWORK'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'SERVER'
  | 'TIMEOUT'
  | 'UNKNOWN';

export class AppError extends Error {
  public readonly name = 'AppError';

  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode?: number,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function createAppError(
  message: string,
  statusCode: number,
  details?: unknown,
): AppError {
  const code: ErrorCode =
    statusCode === 401 ? 'UNAUTHORIZED' :
    statusCode === 403 ? 'FORBIDDEN' :
    statusCode === 404 ? 'NOT_FOUND' :
    statusCode === 422 ? 'VALIDATION' :
    statusCode >= 500 ? 'SERVER' :
    'UNKNOWN';

  return new AppError(message, code, statusCode, details);
}
