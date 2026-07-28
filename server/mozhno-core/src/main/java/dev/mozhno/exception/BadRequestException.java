package dev.mozhno.exception;

/**
 * Thrown when client input is invalid or malformed.
 * Maps to HTTP 400.
 */
public class BadRequestException extends MozhnoException {

    public BadRequestException(String message) {
        super("BAD_REQUEST", message);
    }

    public BadRequestException(String errorCode, String message) {
        super(errorCode, message);
    }

    public BadRequestException(String message, Throwable cause) {
        super("BAD_REQUEST", message, cause);
    }
}
