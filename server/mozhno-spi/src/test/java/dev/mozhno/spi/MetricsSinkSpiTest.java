package dev.mozhno.spi;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MetricsSinkSpiTest {

    @Test
    void recordFlagEvaluationShouldBeCalledWithAllParams() {
        var calls = new java.util.ArrayList<String>();
        MetricsSinkSpi sink = new MetricsSinkSpi() {
            @Override
            public void recordFlagEvaluation(Integer projectId, Integer flagId,
                                              Integer environmentId, boolean enabled) {
                calls.add(projectId + ":" + flagId + ":" + environmentId + ":" + enabled);
            }
            @Override
            public void recordApiCall(Integer projectId, String endpoint,
                                       int statusCode, long latencyMs) {}
        };

        sink.recordFlagEvaluation(1, 42, 3, true);
        sink.recordFlagEvaluation(1, 42, 3, false);

        assertThat(calls).containsExactly("1:42:3:true", "1:42:3:false");
    }

    @Test
    void recordApiCallShouldBeCalledWithLatency() {
        var calls = new java.util.ArrayList<String>();
        MetricsSinkSpi sink = new MetricsSinkSpi() {
            @Override
            public void recordFlagEvaluation(Integer projectId, Integer flagId,
                                              Integer environmentId, boolean enabled) {}
            @Override
            public void recordApiCall(Integer projectId, String endpoint,
                                       int statusCode, long latencyMs) {
                calls.add(projectId + ":" + endpoint + ":" + statusCode + ":" + latencyMs);
            }
        };

        sink.recordApiCall(1, "/api/v1/flags", 200, 45);
        sink.recordApiCall(1, "/api/v1/flags", 500, 1200);

        assertThat(calls).containsExactly("1:/api/v1/flags:200:45", "1:/api/v1/flags:500:1200");
    }

    @Test
    void nullSinkShouldNotThrow() {
        MetricsSinkSpi sink = new MetricsSinkSpi() {
            @Override
            public void recordFlagEvaluation(Integer projectId, Integer flagId,
                                              Integer environmentId, boolean enabled) {}
            @Override
            public void recordApiCall(Integer projectId, String endpoint,
                                       int statusCode, long latencyMs) {}
        };
        sink.recordFlagEvaluation(null, null, null, false);
        sink.recordFlagEvaluation(0, 0, 0, true);
    }
}
