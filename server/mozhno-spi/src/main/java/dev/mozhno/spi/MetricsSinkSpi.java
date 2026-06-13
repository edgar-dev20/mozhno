package dev.mozhno.spi;

/**
 * Service Provider Interface for metrics collection and export.
 * <p>
 * In the Open Core architecture, the community edition ships a Prometheus
 * HTTP endpoint and an in-memory metrics registry. Licensed editions can
 * provide an SPI implementation that forwards metrics to an external sink
 * such as Datadog, New Relic, or a custom time-series database.
 */
public interface MetricsSinkSpi {

    /**
     * Records a feature-flag evaluation event.
     *
     * @param projectId     the project in which the evaluation occurred
     * @param flagId        the evaluated flag's identifier
     * @param environmentId the environment in which the flag was evaluated
     * @param enabled       whether the flag resolved to enabled
     */
    void recordFlagEvaluation(Integer projectId, Integer flagId, Integer environmentId, boolean enabled);

    /**
     * Records an API call made to the Mozhno REST API.
     *
     * @param projectId  the project that owns the API call
     * @param endpoint   the API endpoint path
     * @param statusCode the HTTP status code returned
     * @param latencyMs  the request latency in milliseconds
     */
    void recordApiCall(Integer projectId, String endpoint, int statusCode, long latencyMs);
}
