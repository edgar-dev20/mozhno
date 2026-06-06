package ru.mozhno.spi;

public interface MetricsSinkSpi {

    void recordFlagEvaluation(Integer projectId, Integer flagId, Integer environmentId, boolean enabled);

    void recordApiCall(Integer projectId, String endpoint, int statusCode, long latencyMs);
}
