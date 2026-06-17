package dev.mozhno.exception;

/**
 * Thrown when authentication fails due to invalid credentials or when no provider
 * is available to handle the request.
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
