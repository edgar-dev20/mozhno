package dev.mozhno.client;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ClientEvaluateResponse {
    private List<ToggleResult> toggles;

    public ClientEvaluateResponse(List<ToggleResult> toggles) {
        this.toggles = toggles;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ToggleResult {
        private String name;
        private boolean enabled;
        private VariantData variant;

        public ToggleResult(String name, boolean enabled, VariantData variant) {
            this.name = name;
            this.enabled = enabled;
            this.variant = variant;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class VariantData {
        private String name;
        private boolean enabled;
        private PayloadData payload;

        public VariantData(String name, boolean enabled, PayloadData payload) {
            this.name = name;
            this.enabled = enabled;
            this.payload = payload;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class PayloadData {
        private String type;
        private String value;

        public PayloadData(String type, String value) {
            this.type = type;
            this.value = value;
        }
    }
}
