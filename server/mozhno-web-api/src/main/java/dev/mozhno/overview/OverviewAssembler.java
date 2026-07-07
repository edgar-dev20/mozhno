package dev.mozhno.overview;

import dev.mozhno.audit.AuditAssembler;
import org.springframework.stereotype.Component;

@Component
public class OverviewAssembler {

    private final AuditAssembler auditAssembler;

    public OverviewAssembler(AuditAssembler auditAssembler) {
        this.auditAssembler = auditAssembler;
    }

    public OverviewResponse toResponse(OverviewData data) {
        OverviewData.Totals t = data.totals();
        OverviewData.Onboarding o = data.onboarding();

        return OverviewResponse.builder()
            .totals(OverviewResponse.Totals.builder()
                .totalFlags(t.totalFlags())
                .archivedFlags(t.archivedFlags())
                .staleFlags(t.staleFlags())
                .activeKillswitches(t.activeKillswitches())
                .rolloutsInProgress(t.rolloutsInProgress())
                .build())
            .environments(data.environments().stream()
                .map(e -> OverviewResponse.EnvironmentStat.builder()
                    .environmentId(e.environmentId())
                    .environmentName(e.environmentName())
                    .totalFlags(e.totalFlags())
                    .enabledCount(e.enabledCount())
                    .rolloutCount(e.rolloutCount())
                    .staleCount(e.staleCount())
                    .evalTrue48h(e.evalTrue48h())
                    .evalFalse48h(e.evalFalse48h())
                    .connectedApps(e.connectedApps())
                    .lastSeenAt(e.lastSeenAt())
                    .sdkSilent(e.sdkSilent())
                    .build())
                .toList())
            .onboarding(OverviewResponse.Onboarding.builder()
                .hasFlags(o.hasFlags())
                .hasEnvironments(o.hasEnvironments())
                .hasApiKey(o.hasApiKey())
                .hasConnectedSdk(o.hasConnectedSdk())
                .hasTeam(o.hasTeam())
                .build())
            .recentActivity(auditAssembler.toResponseList(data.recentActivity()))
            .build();
    }
}
