package dev.mozhno.client;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ClientEvaluateRequestTest {
    @Test
    void defaultConstructor_shouldHaveNullFields() {
        ClientEvaluateRequest req = new ClientEvaluateRequest();
        assertThat(req.getContext()).isNull();
        assertThat(req.getToggles()).isNull();
    }

    @Test
    void contextSetter_shouldWork() {
        ClientEvaluateRequest req = new ClientEvaluateRequest();
        req.setContext(Map.of("userId", "123"));
        assertThat(req.getContext()).containsEntry("userId", "123");
    }

    @Test
    void togglesSetter_shouldWork() {
        ClientEvaluateRequest req = new ClientEvaluateRequest();
        req.setToggles(List.of("f1", "f2"));
        assertThat(req.getToggles()).containsExactly("f1", "f2");
    }
}
