package dev.mozhno.overview;

import dev.mozhno.audit.AuditEventResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Builder
@Schema(description = "Aggregated home overview for the current project")
public record OverviewResponse(
    @Schema(description = "Cross-environment totals that need attention")
    Totals totals,
    @Schema(description = "Per-environment statistics")
    List<EnvironmentStat> environments,
    @Schema(description = "Onboarding checklist status")
    Onboarding onboarding,
    @Schema(description = "Most recent audit events")
    List<AuditEventResponse> recentActivity
) {
    @Builder
    public record Totals(
        int totalFlags,
        int archivedFlags,
        int staleFlags,
        int activeKillswitches,
        int rolloutsInProgress
    ) {}

    @Builder
    public record EnvironmentStat(
        int environmentId,
        String environmentName,
        int totalFlags,
        int enabledCount,
        int rolloutCount,
        int staleCount,
        long evalTrue48h,
        long evalFalse48h,
        int connectedApps,
        @Schema(nullable = true)
        Instant lastSeenAt
    ) {}

    @Builder
    public record Onboarding(
        boolean hasFlags,
        boolean hasEnvironments,
        boolean hasApiKey,
        boolean hasConnectedSdk,
        boolean hasTeam
    ) {}
}
