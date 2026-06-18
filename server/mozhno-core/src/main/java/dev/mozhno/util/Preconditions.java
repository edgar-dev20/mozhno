package dev.mozhno.util;

import dev.mozhno.exception.NotFoundException;

public final class Preconditions {

    private Preconditions() {
    }

    public static <T> T requireFound(T entity, String resourceType, Object resourceId) {
        if (entity == null) {
            throw new NotFoundException(resourceType, resourceId);
        }
        return entity;
    }
}
