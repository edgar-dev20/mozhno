package dev.mozhno.client;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Schema(description = "Client SDK evaluation request")
@Data
@NoArgsConstructor
public class ClientEvaluateRequest {
    @Schema(description = "Context key-value pairs for targeting evaluation")
    private Map<String, String> context;

    @Schema(description = "List of flag names to evaluate", nullable = true)
    private List<String> toggles;
}
