package dev.mozhno.client;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Schema(description = "Client SDK metrics reporting request")
@Data
@NoArgsConstructor
public class ClientMetricsRequest {
    @Schema(description = "Map of flag key to evaluation count", example = "{\"dark-mode\": 150}")
    private Map<String, Long> evaluations;
}
