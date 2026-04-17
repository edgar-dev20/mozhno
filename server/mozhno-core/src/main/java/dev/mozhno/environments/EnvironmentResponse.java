package dev.mozhno.environments;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;

@Schema(description = "Deployment environment within a project")
@Builder
public record EnvironmentResponse(
    @Schema(description = "Unique identifier")
    Integer id,
    @Schema(description = "Environment name", example = "Production")
    String name,
    @Schema(description = "Optional description", nullable = true)
    String description,
    @Schema(description = "Project ID")
    Integer projectId,
    @Schema(description = "When the environment was created")
    Instant createdAt
) {}
