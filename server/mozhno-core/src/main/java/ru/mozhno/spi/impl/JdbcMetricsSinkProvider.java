package ru.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import ru.mozhno.metrics.FlagMetricRepository;
import ru.mozhno.spi.MetricsSinkSpi;

@Component
public class JdbcMetricsSinkProvider implements MetricsSinkSpi {

    private final FlagMetricRepository flagMetricRepository;

    public JdbcMetricsSinkProvider(FlagMetricRepository flagMetricRepository) {
        this.flagMetricRepository = flagMetricRepository;
    }

    @Override
    public void recordFlagEvaluation(Integer projectId, Integer flagId, Integer environmentId, boolean enabled) {
        flagMetricRepository.recordEvaluation(projectId, flagId, environmentId, enabled);
    }

    @Override
    public void recordApiCall(Integer projectId, String endpoint, int statusCode, long latencyMs) {
    }
}
