package dev.mozhno.overview;

import dev.mozhno.audit.AuditEvent;

import java.time.Instant;
import java.util.List;

/**
 * Aggregated home-overview data for a single project. Assembled by
 * {@code OverviewService} from flags, environments, metrics, client instances,
 * API keys, users and audit events. Crosses the API boundary via an assembler.
 */
public record OverviewData(
    Totals totals,
    List<EnvironmentStat> environments,
    Onboarding onboarding,
    List<AuditEvent> recentActivity
) {
    /** Project-wide (cross-environment) counters that need attention. */
    public record Totals(
        int totalFlags,
        int archivedFlags,
        int staleFlags,
        int activeKillswitches,
        int rolloutsInProgress
    ) {}

    /** Per-environment statistics. All environments are treated equally. */
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
        Instant lastSeenAt,
        boolean sdkSilent
    ) {}

    /** Onboarding checklist flags derived from project data. */
    public record Onboarding(
        boolean hasFlags,
        boolean hasEnvironments,
        boolean hasApiKey,
        boolean hasConnectedSdk,
        boolean hasTeam
    ) {}
}
