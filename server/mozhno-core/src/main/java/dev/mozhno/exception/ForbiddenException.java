package dev.mozhno.exception;

/**
 * Thrown when the caller lacks permission for the requested action.
 * Maps to HTTP 403.
 */
public class ForbiddenException extends MozhnoException {

    public ForbiddenException(String message) {
        super("FORBIDDEN", message);
    }
}
