package dev.mozhno.client;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ClientMetricsRequestTest {
    @Test
    void defaultConstructor_shouldHaveNullEvaluations() {
        ClientMetricsRequest req = new ClientMetricsRequest();
        assertThat(req.getEvaluations()).isNull();
    }

    @Test
    void setter_shouldWork() {
        ClientMetricsRequest req = new ClientMetricsRequest();
        ClientMetricsRequest.EvalCount ec = new ClientMetricsRequest.EvalCount();
        ec.setTrueCount(5);
        ec.setFalseCount(2);
        req.setEvaluations(Map.of("flag-a", ec));
        assertThat(req.getEvaluations()).containsKey("flag-a");
        assertThat(req.getEvaluations().get("flag-a").getTrueCount()).isEqualTo(5);
        assertThat(req.getEvaluations().get("flag-a").getFalseCount()).isEqualTo(2);
    }
}
