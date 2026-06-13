package dev.mozhno.exception;

/**
 * Base exception for all Mozhno API errors.
 * Every sub-class carries an {@code errorCode} string for machine-readable
 * error discrimination, a human-readable {@code message}, and optional
 * structured {@code details}.
 */
public abstract class MozhnoException extends RuntimeException {

    private final String errorCode;

    protected MozhnoException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    protected MozhnoException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
