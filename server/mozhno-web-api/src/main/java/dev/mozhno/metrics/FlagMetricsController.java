package dev.mozhno.metrics;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Metrics", description = "Feature flag evaluation metrics")
public class FlagMetricsController {
    private final FlagMetricsService flagMetricsService;
    private final MetricsAssembler metricsAssembler;

    @GetMapping("/api/v1/flags/{flagId}/metrics")
    @Operation(summary = "Get evaluation metrics for a specific flag")
    public List<FlagMetricResponse> getFlagMetrics(@PathVariable Integer flagId,
                                                   @RequestParam Integer environmentId,
                                                   @RequestParam(required = false) Long instanceId,
                                                   @RequestParam(required = false) String appName,
                                                   @AuthenticationPrincipal UserPrincipal user) {
        List<FlagMetric> metrics;
        if (instanceId != null) {
            metrics = flagMetricsService.getMetricsByInstance(flagId, environmentId, instanceId);
        } else if (appName != null && !appName.isEmpty()) {
            metrics = flagMetricsService.getMetricsByAppName(flagId, environmentId, appName);
        } else {
            metrics = flagMetricsService.getMetrics(flagId, environmentId);
        }
        return metricsAssembler.toResponseList(metrics);
    }

    @GetMapping("/api/v1/metrics")
    @Operation(summary = "Get evaluation metrics for all flags in a project")
    public List<FlagMetricResponse> getProjectMetrics(@RequestParam(required = false) Integer environmentId,
                                                      @AuthenticationPrincipal UserPrincipal user) {
        List<FlagMetric> metrics = flagMetricsService.getProjectMetrics(user.projectId(), environmentId);
        return metricsAssembler.toResponseList(metrics);
    }

    @GetMapping("/api/v1/flags/{flagId}/metrics/contributors")
    @Operation(summary = "Get per-instance flag contributors over the last 48 hours")
    public List<FlagContributorResponse> getContributors(@PathVariable Integer flagId,
                                                         @RequestParam Integer environmentId,
                                                         @AuthenticationPrincipal UserPrincipal user) {
        List<FlagContributor> contributors = flagMetricsService.getContributors(flagId, environmentId);
        return metricsAssembler.toContributorResponseList(contributors);
    }
}
