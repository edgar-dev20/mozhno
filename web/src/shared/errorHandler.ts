import { AppError, isAppError } from "@/shared/errors";
import { t, type MessageKey } from "@/i18n";

const ERROR_CODE_TO_KEY: Record<string, string> = {
  NETWORK: 'errors.network',
  UNAUTHORIZED: 'errors.unauthorized',
  FORBIDDEN: 'errors.forbidden',
  NOT_FOUND: 'errors.notFound',
  VALIDATION: 'errors.validation',
  SERVER: 'errors.server',
  TIMEOUT: 'errors.timeout',
  UNKNOWN: 'errors.unexpected',
};

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    const key = ERROR_CODE_TO_KEY[error.code];
    if (key) return t(key as MessageKey);
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  return 'UNKNOWN';
}

export function shouldRetry(error: unknown): boolean {
  if (isAppError(error)) {
    return error.code === 'NETWORK' || error.code === 'TIMEOUT' || error.code === 'SERVER';
  }
  return false;
}

export function shouldRedirect(error: unknown): boolean {
  if (isAppError(error)) {
    return error.code === 'UNAUTHORIZED';
  }
  return false;
}

export { isAppError, AppError };
export type { ErrorCode } from "@/shared/errors";
