package dev.mozhno.contexts;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Schema(description = "Request body for creating or updating a context definition")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContextDefinitionRequest {
    @Schema(description = "Project ID")
    private Integer projectId;

    @NotBlank @Size(max = 255)
    @Schema(description = "Human-readable name", example = "Country")
    private String name;

    @NotBlank @Size(max = 255)
    @Schema(description = "Machine-friendly key used in SDKs", example = "country")
    private String key;

    @Size(max = 50)
    @Schema(description = "Data type of the context value", example = "string")
    private String type;

    @Size(max = 1000)
    @Schema(description = "Optional description", nullable = true)
    private String description;
}
