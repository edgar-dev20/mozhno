package dev.mozhno.exception;

/**
 * Thrown when a resource already exists and cannot be duplicated.
 * Maps to HTTP 409.
 */
public class ConflictException extends MozhnoException {

    public ConflictException(String message) {
        super("CONFLICT", message);
    }
}
