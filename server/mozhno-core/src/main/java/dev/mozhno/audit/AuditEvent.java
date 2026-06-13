package dev.mozhno.audit;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Represents a single audit log entry recording user actions and system events.
 */
@Getter
@Setter
@NoArgsConstructor
public class AuditEvent {
    /** Unique identifier. */
    private Integer id;
    /** Project ID (null for system events). */
    private Integer projectId;
    /** ID of the user who performed the action. */
    private Integer userId;
    /** Name of the user who performed the action. */
    private String userName;
    /** Email of the user who performed the action. */
    private String userEmail;
    /** The action performed (e.g. "flag.created"). */
    private String action;
    /** Type of resource affected (e.g. "flag", "project"). */
    private String resourceType;
    /** ID of the affected resource. */
    private Integer resourceId;
    /** Name of the affected resource. */
    private String resourceName;
    /** Additional event details. */
    private String details;
    /** IP address of the user. */
    private String ipAddress;
    /** When the event was recorded. */
    private Instant createdAt;
}
