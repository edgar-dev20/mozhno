package dev.mozhno.flags.strategy;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Schema(description = "Request body for creating or updating a flag strategy")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StrategyRequest {
    @Schema(description = "Flag ID")
    private Integer flagId;

    @Schema(description = "Environment ID")
    private Integer environmentId;

    @Schema(description = "Whether the strategy is enabled")
    private Boolean enabled;

    @Schema(description = "Rollout percentage (0-100)", example = "50.0")
    private Double percentage;

    @Schema(description = "Context definition ID for constraint targeting", nullable = true)
    private Integer contextDefinitionId;

    @Size(max = 5000)
    @Schema(description = "JSON array of context constraints", nullable = true)
    private String contextValuesJson;

    @Schema(description = "List of segment IDs to target", nullable = true)
    private List<Integer> segmentIds;
}