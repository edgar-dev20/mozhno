package dev.mozhno.segments;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Schema(description = "Request body for creating or updating a segment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SegmentRequest {
    @Schema(description = "Project ID")
    private Integer projectId;

    @NotBlank @Size(max = 255)
    @Schema(description = "Segment name", example = "Premium users")
    private String name;

    @Size(max = 1000)
    @Schema(description = "Optional description", nullable = true)
    private String description;

    @Size(max = 50)
    @Schema(description = "Icon identifier", example = "Users")
    private String icon;

    @Size(max = 7)
    @Schema(description = "Color hex code", example = "#3b82f1")
    private String color;

    @Schema(description = "List of context targeting rules", nullable = true)
    private java.util.List<ContextEntry> context;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Context targeting rule within a segment")
    public static class ContextEntry {
        @Schema(description = "Context definition ID")
        private Integer contextDefinitionId;

        @Schema(description = "Operator (e.g. in, not_in)", example = "in")
        private String operator;

        @Schema(description = "Comma-separated context values", example = "US,CA,UK")
        private String contextValues;
    }
}