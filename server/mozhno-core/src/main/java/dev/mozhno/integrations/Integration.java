package dev.mozhno.integrations;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Represents a third-party integration configuration (e.g. webhook, Slack).
 */
@Getter
@Setter
@NoArgsConstructor
public class Integration {
    /** Unique identifier. */
    private Integer id;
    /** Project this integration belongs to. */
    private Integer projectId;
    /** Integration type (e.g. "webhook", "slack"). */
    private String type;
    /** Human-readable name. */
    private String name;
    /** Whether the integration is active. */
    private boolean enabled;
    /** Integration configuration as JSON. */
    private String configJson;
    /** Event subscriptions as JSON. */
    private String eventSubscriptionsJson;
    /** Last dispatch error message, null if the last dispatch succeeded. */
    private String lastError;
    /** When the integration was created. */
    private Instant createdAt;
    /** When the integration was last updated. */
    private Instant updatedAt;
}
