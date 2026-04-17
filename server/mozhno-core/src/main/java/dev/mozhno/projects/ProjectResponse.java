package dev.mozhno.projects;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;

@Schema(description = "Project information")
@Builder
public record ProjectResponse(
    @Schema(description = "Unique identifier")
    Integer id,

    @Schema(description = "Project name", example = "My Project")
    String name,

    @Schema(description = "Project description", nullable = true)
    String description,

    @Schema(description = "Logo image filename", nullable = true)
    String logo,

    @Schema(description = "When the project was created")
    Instant createdAt
) {}
