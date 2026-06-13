package dev.mozhno.audit;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;

@Schema(description = "Audit log entry recording a user action or system event")
@Builder
public record AuditEventResponse(
    @Schema(description = "Unique identifier")
    Integer id,

    @Schema(description = "Project ID (null for system events)", nullable = true)
    Integer projectId,

    @Schema(description = "ID of the user who performed the action", nullable = true)
    Integer userId,

    @Schema(description = "Name of the user who performed the action", nullable = true)
    String userName,

    @Schema(description = "Email of the user who performed the action", nullable = true)
    String userEmail,

    @Schema(description = "The action performed", example = "flag.created")
    String action,

    @Schema(description = "Type of resource affected", example = "flag")
    String resourceType,

    @Schema(description = "ID of the affected resource", nullable = true)
    Integer resourceId,

    @Schema(description = "Name of the affected resource", nullable = true)
    String resourceName,

    @Schema(description = "Additional event details", nullable = true)
    String details,

    @Schema(description = "IP address of the user", nullable = true)
    String ipAddress,

    @Schema(description = "When the event was recorded")
    Instant createdAt
) {}
