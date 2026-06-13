package dev.mozhno.exception;

/**
 * Thrown when a requested resource (flag, project, user, etc.) is not found.
 * Maps to HTTP 404.
 */
public class NotFoundException extends MozhnoException {

    public NotFoundException(String resourceType, Object id) {
        super("NOT_FOUND", resourceType + " not found: " + id);
    }

    /**
     * Creates a type-safe Not Found exception using the resource class name.
     *
     * @param resourceClass the entity class (e.g. {@code Flag.class})
     * @param id            the resource identifier
     */
    public NotFoundException(Class<?> resourceClass, Object id) {
        super(resourceClass.getSimpleName().toUpperCase() + "_NOT_FOUND",
              resourceClass.getSimpleName() + " not found: " + id);
    }

    public NotFoundException(String message) {
        super("NOT_FOUND", message);
    }
}
