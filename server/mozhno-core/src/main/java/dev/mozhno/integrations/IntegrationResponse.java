package dev.mozhno.integrations;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;

@Schema(description = "Third-party integration configuration")
@Builder
public record IntegrationResponse(
    @Schema(description = "Unique identifier")
    Integer id,

    @Schema(description = "Project ID")
    Integer projectId,

    @Schema(description = "Integration type", example = "webhook")
    String type,

    @Schema(description = "Human-readable name", example = "Slack Notifications")
    String name,

    @Schema(description = "Whether the integration is active")
    boolean enabled,

    @Schema(description = "Last dispatch error message", nullable = true)
    String lastError,

    @Schema(description = "When the integration was created")
    Instant createdAt,

    @Schema(description = "When the integration was last updated")
    Instant updatedAt
) {}
