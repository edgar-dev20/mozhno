package dev.mozhno.tags;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;

@Schema(description = "Tag for categorizing and organizing flags")
@Builder
public record TagResponse(
    @Schema(description = "Unique identifier")
    Integer id,
    @Schema(description = "Tag name", example = "Performance")
    String name,
    @Schema(description = "Optional description", nullable = true)
    String description,
    @Schema(description = "Color hex code", example = "#ff0000")
    String color,
    @Schema(description = "Project ID")
    Integer projectId,
    @Schema(description = "When the tag was created")
    Instant createdAt
) {}
