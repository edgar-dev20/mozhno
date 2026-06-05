package ru.mozhno.metrics;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FlagMetricsController {
    private final FlagMetricsService flagMetricsService;

    public FlagMetricsController(FlagMetricsService flagMetricsService) {
        this.flagMetricsService = flagMetricsService;
    }

    @GetMapping("/api/v1/flags/{flagId}/metrics")
    public List<FlagMetric> getFlagMetrics(@PathVariable Integer flagId, @RequestParam Integer environmentId) {
        return flagMetricsService.getMetrics(flagId, environmentId);
    }

    @GetMapping("/api/v1/projects/{projectId}/metrics")
    public List<FlagMetric> getProjectMetrics(@PathVariable Integer projectId, @RequestParam(required = false) Integer environmentId) {
        return flagMetricsService.getProjectMetrics(projectId, environmentId);
    }
}
