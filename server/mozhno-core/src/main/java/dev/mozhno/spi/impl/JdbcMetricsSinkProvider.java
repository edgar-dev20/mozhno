package dev.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import dev.mozhno.metrics.FlagMetricRepository;
import dev.mozhno.spi.MetricsSinkSpi;

/**
 * Default {@link MetricsSinkSpi} implementation that persists feature flag
 * evaluation metrics to a relational database via {@link FlagMetricRepository}.
 *
 * <p>This is the community-edition metrics sink. Flag evaluation events are
 * recorded synchronously in the database. API call metrics are not collected
 * in the open-source edition — the {@link #recordApiCall} method is a no-op.
 */
@Component
public class JdbcMetricsSinkProvider implements MetricsSinkSpi {

    private final FlagMetricRepository flagMetricRepository;

    public JdbcMetricsSinkProvider(FlagMetricRepository flagMetricRepository) {
        this.flagMetricRepository = flagMetricRepository;
    }

    /**
     * Records a single feature flag evaluation event.
     *
     * @param projectId     the project in which the flag was evaluated
     * @param flagId        the evaluated flag's identifier
     * @param environmentId the environment in which the evaluation occurred
     * @param enabled       {@code true} if the flag resolved to enabled
     * @implNote Writes synchronously to the flag metrics table via
     *           {@link FlagMetricRepository#recordEvaluation}.
     */
    @Override
    public void recordFlagEvaluation(Integer projectId, Integer flagId, Integer environmentId, boolean enabled) {
        flagMetricRepository.recordEvaluation(projectId, flagId, environmentId, enabled);
    }

    /**
     * Records an API call metric.
     *
     * @param projectId  the project for which the API was called
     * @param endpoint   the called endpoint path
     * @param statusCode the HTTP status code returned
     * @param latencyMs  the request latency in milliseconds
     * @implNote This is a no-op in the open-source edition. API call metrics
     *           are only collected in licensed editions.
     */
    @Override
    public void recordApiCall(Integer projectId, String endpoint, int statusCode, long latencyMs) {
    }
}
