package dev.mozhno.flags;

import dev.mozhno.contexts.ContextDefinitionResponse;
import dev.mozhno.environments.EnvironmentResponse;
import dev.mozhno.segments.SegmentResponse;
import dev.mozhno.tags.TagResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Paginated dashboard data containing flags, segments, tags, contexts, and environments")
public record PaginatedDashboardResponse(
    @Schema(description = "List of enriched flags")
    List<EnrichedFlagResponse> flags,

    @Schema(description = "Current page number (0-based)")
    int page,

    @Schema(description = "Page size")
    int size,

    @Schema(description = "Total number of items across all pages")
    long totalItems,

    @Schema(description = "Total number of pages")
    int totalPages,

    @Schema(description = "All segments in the project")
    List<SegmentResponse> segments,

    @Schema(description = "All tags in the project")
    List<TagResponse> tags,

    @Schema(description = "All context definitions in the project")
    List<ContextDefinitionResponse> contexts,

    @Schema(description = "All environments in the project")
    List<EnvironmentResponse> environments
) {}
