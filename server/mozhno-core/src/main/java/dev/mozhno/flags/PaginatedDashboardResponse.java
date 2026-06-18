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
) {
    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private List<EnrichedFlagResponse> flags;
        private int page;
        private int size;
        private long totalItems;
        private int totalPages;
        private List<SegmentResponse> segments;
        private List<TagResponse> tags;
        private List<ContextDefinitionResponse> contexts;
        private List<EnvironmentResponse> environments;

        public Builder flags(List<EnrichedFlagResponse> flags) { this.flags = flags; return this; }
        public Builder page(int page) { this.page = page; return this; }
        public Builder size(int size) { this.size = size; return this; }
        public Builder totalItems(long totalItems) { this.totalItems = totalItems; return this; }
        public Builder totalPages(int totalPages) { this.totalPages = totalPages; return this; }
        public Builder segments(List<SegmentResponse> segments) { this.segments = segments; return this; }
        public Builder tags(List<TagResponse> tags) { this.tags = tags; return this; }
        public Builder contexts(List<ContextDefinitionResponse> contexts) { this.contexts = contexts; return this; }
        public Builder environments(List<EnvironmentResponse> environments) { this.environments = environments; return this; }

        public PaginatedDashboardResponse build() {
            return new PaginatedDashboardResponse(flags, page, size, totalItems, totalPages, segments, tags, contexts, environments);
        }
    }
}
