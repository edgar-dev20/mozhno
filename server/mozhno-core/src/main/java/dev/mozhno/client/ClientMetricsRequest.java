package dev.mozhno.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Schema(description = "Client SDK metrics reporting request")
@Data
@NoArgsConstructor
public class ClientMetricsRequest {
    @Schema(description = "Map of flag key to evaluation counts with true/false split")
    private Map<String, EvalCount> evaluations;

    @Data
    @NoArgsConstructor
    public static class EvalCount {
        @JsonProperty("t")
        private long trueCount;
        @JsonProperty("f")
        private long falseCount;
    }
}
