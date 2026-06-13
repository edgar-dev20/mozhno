package dev.mozhno.segments;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;
import java.util.List;

@Schema(description = "User segment with context-based targeting rules")
@Builder
public record SegmentResponse(
    @Schema(description = "Unique identifier")
    Integer id,

    @Schema(description = "Project ID")
    Integer projectId,

    @Schema(description = "Segment name", example = "Premium users")
    String name,

    @Schema(description = "Segment description", nullable = true)
    String description,

    @Schema(description = "Icon identifier", example = "Users")
    String icon,

    @Schema(description = "Color hex code", example = "#3b82f1")
    String color,

    @Schema(description = "Context targeting rules")
    List<ContextEntryResponse> context,

    @Schema(description = "When the segment was created")
    Instant createdAt
) {
    @Builder
    @Schema(description = "Context targeting rule in a segment")
    public record ContextEntryResponse(
        @Schema(description = "Context definition ID")
        Integer contextDefinitionId,

        @Schema(description = "Operator (e.g. in, not_in)", example = "in")
        String operator,

        @Schema(description = "Comma-separated context values", example = "US,CA,UK")
        String contextValues
    ) {}
}
