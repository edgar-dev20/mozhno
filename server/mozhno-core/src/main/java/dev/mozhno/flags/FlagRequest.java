package dev.mozhno.flags;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Schema(description = "Request body for creating or updating a feature flag")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlagRequest {
    @Schema(description = "Project ID")
    private Integer projectId;

    @NotBlank @Size(max = 255)
    @Schema(description = "Human-readable flag name", example = "Dark Mode")
    private String name;

    @NotBlank @Size(max = 255)
    @Schema(description = "Unique key used in SDKs", example = "dark-mode")
    private String key;

    @Size(max = 1000)
    @Schema(description = "Optional description", nullable = true)
    private String description;

    @Schema(description = "Flag type: RELEASE or KILLSWITCH", example = "RELEASE")
    private String flagType;

    @Valid
    @Schema(description = "Optional list of tag assignments", nullable = true)
    private List<TagValue> tags;

    @Schema(description = "Whether the flag should be enabled")
    private Boolean enabled;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Tag-value pair assignment")
    public static class TagValue {
        @Schema(description = "Tag ID")
        private Integer tagId;

        @Size(max = 255)
        @Schema(description = "Value assigned to the tag")
        private String value;
    }
}