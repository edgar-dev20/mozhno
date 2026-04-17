package dev.mozhno.events;

/**
 * A lightweight domain event published when a significant action occurs.
 *
 * <p>Carries the project context, action name (e.g. {@code user.created}),
 * resource type and id, and an optional human-readable detail string.
 * Consumed by {@link AuditEventListener} and {@link IntegrationEventListener}.</p>
 */
public record DomainEvent(
    Integer projectId,
    String action,
    String resourceType,
    Integer resourceId,
    String resourceName,
    String details,
    Integer userId,
    String userName,
    String userEmail
) {
    public static DomainEvent of(Integer projectId, String action, String resourceType,
                                  Integer resourceId, String resourceName, String details) {
        return new DomainEvent(projectId, action, resourceType, resourceId, resourceName, details,
            null, null, null);
    }
}