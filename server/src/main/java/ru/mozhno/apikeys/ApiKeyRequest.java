package ru.mozhno.apikeys;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request body for creating or updating an API key")
public class ApiKeyRequest {
    @NotBlank @Size(max = 255)
    @Schema(description = "Human-readable name for the API key (e.g. 'Production App')", example = "My Application")
    private String name;

    @Schema(description = "Environment ID to restrict this key to (null for all environments)", example = "1", nullable = true)
    private Integer environmentId;

    @Size(max = 1000)
    @Schema(description = "Optional description for the API key", example = "Used by the production web app", nullable = true)
    private String description;

    public ApiKeyRequest() {}

    public ApiKeyRequest(String name, Integer environmentId, String description) {
        this.name = name;
        this.environmentId = environmentId;
        this.description = description;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(Integer environmentId) { this.environmentId = environmentId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}