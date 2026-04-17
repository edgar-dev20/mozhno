package dev.mozhno.spi;

import java.time.Instant;

/**
 * Service Provider Interface for audit logging.
 * <p>
 * In the Open Core architecture, the community edition ships a simple file-based
 * audit implementation. Licensed editions can provide a custom SPI implementation
 * that persists audit records to an external database, forwards them to a SIEM,
 * or enriches them with additional metadata before storage.
 */
public interface AuditSpi {

    /**
     * Persists or forwards the given audit record.
     *
     * @param record the audit event to log
     */
    void log(AuditRecord record);

    /**
     * A single auditable event capturing the actor, target resource, and action.
     *
     * @param projectId    the project in which the action occurred
     * @param userId       the user who performed the action
     * @param userName     the user's display name
     * @param userEmail    the user's email address
     * @param action       the action performed (e.g. {@code "CREATE"}, {@code "DELETE"})
     * @param resourceType the type of resource acted upon (e.g. {@code "FLAG"})
     * @param resourceId   the affected resource's identifier
     * @param resourceName the affected resource's human-readable name
     * @param details      additional free-form event details
     * @param ipAddress    the originating IP address
     */
    record AuditRecord(
        Integer projectId,
        Integer userId,
        String userName,
        String userEmail,
        String action,
        String resourceType,
        Integer resourceId,
        String resourceName,
        String details,
        String ipAddress
    ) {}
}
