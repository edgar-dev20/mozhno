package dev.mozhno.client;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClientEvaluateResponseTest {
    @Test
    void defaultConstructor_shouldHaveNullToggles() {
        ClientEvaluateResponse resp = new ClientEvaluateResponse();
        assertThat(resp.getToggles()).isNull();
    }

    @Test
    void listConstructor_shouldSetToggles() {
        var toggles = List.of(new ClientEvaluateResponse.ToggleResult("f", true,
            new ClientEvaluateResponse.VariantData("disabled", false, null)));
        ClientEvaluateResponse resp = new ClientEvaluateResponse(toggles);
        assertThat(resp.getToggles()).hasSize(1);
    }

    @Test
    void toggleResult_shouldReturnFields() {
        var variant = new ClientEvaluateResponse.VariantData("blue", true,
            new ClientEvaluateResponse.PayloadData("string", "hello"));
        var result = new ClientEvaluateResponse.ToggleResult("my-flag", true, variant);

        assertThat(result.getName()).isEqualTo("my-flag");
        assertThat(result.isEnabled()).isTrue();
        assertThat(result.getVariant().getName()).isEqualTo("blue");
        assertThat(result.getVariant().getPayload().getType()).isEqualTo("string");
        assertThat(result.getVariant().getPayload().getValue()).isEqualTo("hello");
    }

    @Test
    void variantData_disabled_shouldWork() {
        var variant = new ClientEvaluateResponse.VariantData("disabled", false, null);
        assertThat(variant.getName()).isEqualTo("disabled");
        assertThat(variant.isEnabled()).isFalse();
    }

    @Test
    void payloadData_defaults() {
        var p = new ClientEvaluateResponse.PayloadData();
        assertThat(p.getType()).isNull();
        assertThat(p.getValue()).isNull();
    }

    @Test
    void setters_shouldWork() {
        var result = new ClientEvaluateResponse.ToggleResult();
        result.setName("f");
        result.setEnabled(true);
        result.setVariant(new ClientEvaluateResponse.VariantData());

        assertThat(result.getName()).isEqualTo("f");
        assertThat(result.isEnabled()).isTrue();
    }
}
