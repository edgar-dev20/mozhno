package dev.mozhno.metrics;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Service for retrieving flag evaluation metrics over the last 48 hours.
 */
@Service
public class FlagMetricsService {
    private final FlagMetricRepository flagMetricRepository;

    public FlagMetricsService(FlagMetricRepository flagMetricRepository) {
        this.flagMetricRepository = flagMetricRepository;
    }

    /**
     * Returns aggregated metrics for a specific flag and environment over the last 48 hours.
     *
     * @param flagId the flag ID
     * @param environmentId the environment ID
     * @return list of hourly metrics
     */
    public List<FlagMetric> getMetrics(Integer flagId, Integer environmentId) {
        Instant since = Instant.now().minus(48, ChronoUnit.HOURS).truncatedTo(ChronoUnit.HOURS);
        return flagMetricRepository.findByFlagIdAndEnvironmentId(flagId, environmentId, since);
    }

    /**
     * Returns per-instance metrics for a specific flag, environment, and client instance.
     */
    public List<FlagMetric> getMetricsByInstance(Integer flagId, Integer environmentId, Long instanceId) {
        Instant since = Instant.now().minus(48, ChronoUnit.HOURS).truncatedTo(ChronoUnit.HOURS);
        return flagMetricRepository.findByFlagIdAndEnvironmentIdAndInstanceId(flagId, environmentId, instanceId, since);
    }

    /**
     * Returns per-app metrics for a specific flag and environment, filtered by app_name.
     */
    public List<FlagMetric> getMetricsByAppName(Integer flagId, Integer environmentId, String appName) {
        Instant since = Instant.now().minus(48, ChronoUnit.HOURS).truncatedTo(ChronoUnit.HOURS);
        return flagMetricRepository.findByFlagIdAndEnvironmentIdAndAppName(flagId, environmentId, appName, since);
    }

    /**
     * Returns per-instance contributor summaries for a specific flag and environment over the last 48 hours.
     *
     * @param flagId the flag ID
     * @param environmentId the environment ID
     * @return list of contributors ordered by total contribution descending
     */
    public List<FlagContributor> getContributors(Integer flagId, Integer environmentId) {
        Instant since = Instant.now().minus(48, ChronoUnit.HOURS).truncatedTo(ChronoUnit.HOURS);
        return flagMetricRepository.findContributors(flagId, environmentId, since);
    }

    /**
     * Returns metrics for all flags in a project, optionally filtered by environment, over the last 48 hours.
     *
     * @param projectId the project ID
     * @param environmentId the environment ID, may be null for all environments
     * @return list of hourly metrics
     */
    public List<FlagMetric> getProjectMetrics(Integer projectId, Integer environmentId) {
        Instant since = Instant.now().minus(48, ChronoUnit.HOURS).truncatedTo(ChronoUnit.HOURS);
        if (environmentId != null) {
            return flagMetricRepository.findByProjectIdAndEnvironmentId(projectId, environmentId, since);
        }
        return flagMetricRepository.findByProjectId(projectId, since);
    }
}
