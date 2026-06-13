package dev.mozhno.apikeys;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * API key entity for client SDK authentication.
 */
@Getter
@Setter
@NoArgsConstructor
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
    @Schema(description = "Key type: SERVER or FRONTEND", example = "SERVER")
    private String keyType;
}