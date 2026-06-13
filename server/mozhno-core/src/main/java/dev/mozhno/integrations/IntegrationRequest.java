package dev.mozhno.integrations;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Schema(description = "Request body for creating or updating an integration")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationRequest {
    @Schema(description = "Project ID")
    private Integer projectId;

    @Schema(description = "Integration type", example = "webhook")
    private String type;

    @Schema(description = "Human-readable name", example = "Slack Notifications")
    private String name;

    @Schema(description = "Whether the integration is active")
    private boolean enabled;

    @Schema(description = "Configuration as JSON", nullable = true)
    private String configJson;

    @Schema(description = "Event subscriptions as JSON", nullable = true)
    private String eventSubscriptionsJson;
}