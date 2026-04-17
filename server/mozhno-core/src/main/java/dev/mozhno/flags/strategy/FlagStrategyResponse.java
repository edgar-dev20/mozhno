package dev.mozhno.flags.strategy;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;
import java.util.List;

@Schema(description = "Strategy configuration for a flag in a specific environment")
@Builder
public record FlagStrategyResponse(
    @Schema(description = "Unique identifier")
    Integer id,

    @Schema(description = "Flag ID this strategy belongs to")
    Integer flagId,

    @Schema(description = "Environment ID this strategy applies to")
    Integer environmentId,

    @Schema(description = "Whether the strategy is enabled")
    boolean enabled,

    @Schema(description = "Rollout percentage (0-100)", nullable = true)
    Double percentage,

    @Schema(description = "Context definition ID for constraint targeting", nullable = true)
    Integer contextDefinitionId,

    @Schema(description = "Name of the context definition", nullable = true)
    String contextName,

    @Schema(description = "JSON array of context constraints", nullable = true)
    String contextValuesJson,

    @Schema(description = "List of segment IDs to target", nullable = true)
    List<Integer> segmentIds,

    @Schema(description = "Name of the environment", nullable = true)
    String environmentName,

    @Schema(description = "When the strategy was created")
    Instant createdAt,

    @Schema(description = "When the strategy was last evaluated", nullable = true)
    Instant lastUsedAt
) {}
