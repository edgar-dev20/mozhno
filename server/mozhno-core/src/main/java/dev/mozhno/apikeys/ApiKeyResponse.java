package dev.mozhno.apikeys;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;

@Schema(description = "API key response")
@Builder
public record ApiKeyResponse(
    @Schema(description = "Unique identifier")
    Integer id,
    @Schema(description = "Project ID")
    Integer projectId,
    @Schema(description = "Environment ID this key is restricted to (null means all environments)", nullable = true)
    Integer environmentId,
    @Schema(description = "Human-readable name", example = "Production App")
    String name,
    @Schema(description = "Optional description", nullable = true)
    String description,
    @Schema(description = "The API key token", example = "sk-abc123...")
    String apiKey,
    @Schema(description = "Key type: SERVER or FRONTEND", example = "SERVER")
    String keyType,
    @Schema(description = "When the key was last used (null if never)", nullable = true)
    Instant lastUsedAt,
    @Schema(description = "When the key was created")
    Instant createdAt
) {}
