package ru.mozhno.apikeys;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "API key entity for client SDK authentication")
public class ApiKey {
    @Schema(description = "Unique identifier")
    private Integer id;

    @Schema(description = "Project ID this key belongs to")
    private Integer projectId;

    @Schema(description = "Environment ID this key is restricted to (null means all environments)", nullable = true)
    private Integer environmentId;

    @Schema(description = "Human-readable name", example = "Production App")
    private String name;

    @Schema(description = "Optional description", nullable = true)
    private String description;

    @Schema(description = "The actual API key token (64 characters)", example = "abc123...")
    private String apiKey;

    @Schema(description = "When the key was created")
    private Instant createdAt;

    @Schema(description = "When the key was last used (null if never)", nullable = true)
    private Instant lastUsedAt;

    public ApiKey() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public Integer getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(Integer environmentId) { this.environmentId = environmentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }
}