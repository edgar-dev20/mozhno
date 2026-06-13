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
        req.setEvaluations(Map.of("flag-a", 5L));
        assertThat(req.getEvaluations()).containsEntry("flag-a", 5L);
    }
}
