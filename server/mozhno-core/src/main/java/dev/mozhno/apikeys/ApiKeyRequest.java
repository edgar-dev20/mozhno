package dev.mozhno.apikeys;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Schema(description = "Request body for creating or updating an API key")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiKeyRequest {
    @NotBlank @Size(max = 255)
    @Schema(description = "Human-readable name for the API key", example = "My Application")
    private String name;

    @Schema(description = "Environment ID to restrict this key to (null for all environments)", example = "1", nullable = true)
    private Integer environmentId;

    @Size(max = 1000)
    @Schema(description = "Optional description for the API key", example = "Used by the production web app", nullable = true)
    private String description;

    @Schema(description = "Key type: SERVER or FRONTEND", example = "SERVER", defaultValue = "SERVER")
    private String keyType;
}