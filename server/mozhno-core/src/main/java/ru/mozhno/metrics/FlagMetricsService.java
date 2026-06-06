package ru.mozhno.metrics;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class FlagMetricsService {
    private final FlagMetricRepository flagMetricRepository;

    public FlagMetricsService(FlagMetricRepository flagMetricRepository) {
        this.flagMetricRepository = flagMetricRepository;
    }

    public List<FlagMetric> getMetrics(Integer flagId, Integer environmentId) {
        Instant since = Instant.now().minus(48, ChronoUnit.HOURS).truncatedTo(ChronoUnit.HOURS);
        return flagMetricRepository.findByFlagIdAndEnvironmentId(flagId, environmentId, since);
    }

    public List<FlagMetric> getProjectMetrics(Integer projectId, Integer environmentId) {
        Instant since = Instant.now().minus(48, ChronoUnit.HOURS).truncatedTo(ChronoUnit.HOURS);
        if (environmentId != null) {
            return flagMetricRepository.findByProjectIdAndEnvironmentId(projectId, environmentId, since);
        }
        return flagMetricRepository.findByProjectId(projectId, since);
    }
}
