package dev.mozhno.flags;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Builder
public record EnrichedFlagResponse(
    @Schema(description = "Unique identifier")
    Integer id,
    @Schema(description = "Project ID")
    Integer projectId,
    @Schema(description = "Flag name", example = "Dark Mode")
    String name,
    @Schema(description = "Unique key used in SDKs", example = "dark-mode")
    String key,
    @Schema(description = "Optional description")
    String description,
    @Schema(description = "Flag type: RELEASE or KILLSWITCH", example = "RELEASE")
    String flagType,
    @Schema(description = "When the flag was created")
    Instant createdAt,
    @Schema(description = "Name and email of the creator")
    String createdBy,
    @Schema(description = "When the flag was last evaluated", nullable = true)
    Instant lastUsedAt,
    @Schema(description = "Name and email of the user who archived the flag", nullable = true)
    String archivedBy,
    @Schema(description = "When the flag was archived", nullable = true)
    Instant archivedAt,
    @Schema(description = "Tags attached to this flag")
    List<TagValueResponse> tags,
    @Schema(description = "Per-environment state configurations")
    List<EnvironmentState> environments,
    @Schema(description = "Whether the flag is archived")
    boolean archived
) {
    @Builder
    public record EnvironmentState(
        @Schema(description = "Environment ID")
        Integer environmentId,
        @Schema(description = "Environment name")
        String environmentName,
        @Schema(description = "Whether enabled in this environment")
        boolean enabled,
        @Schema(description = "Rollout percentage", nullable = true)
        Double percentage,
        @Schema(description = "List of segment IDs to target", nullable = true)
        List<Integer> segmentIds,
        @Schema(description = "Strategy ID")
        Integer strategyId,
        @Schema(description = "Context definition ID for constraint targeting", nullable = true)
        Integer contextDefinitionId,
        @Schema(description = "JSON array of context constraints", nullable = true)
        String contextValuesJson,
        @Schema(description = "When the strategy was last used", nullable = true)
        Instant lastUsedAt
    ) {}

    @Builder
    public record TagValueResponse(
        @Schema(description = "Tag ID")
        Integer tagId,
        @Schema(description = "Tag name")
        String tagName,
        @Schema(description = "Tag color hex code")
        String tagColor,
        @Schema(description = "Tag value")
        String value
    ) {}
}
