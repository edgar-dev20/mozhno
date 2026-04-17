package dev.mozhno.flags.strategy;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.List;

/**
 * Strategy configuration for a flag in a specific environment.
 * Controls enabled status, rollout percentage, context constraints, and segment targeting.
 */
@Getter
@Setter
@NoArgsConstructor
public class FlagStrategy {
    /** Unique identifier. */
    private Integer id;
    /** Flag this strategy belongs to. */
    private Integer flagId;
    /** Environment this strategy applies to. */
    private Integer environmentId;
    /** Whether the strategy is enabled. */
    private boolean enabled;
    /** Rollout percentage (0-100). Null means not configured. */
    private Double percentage;
    /** Context definition ID for constraint targeting. */
    private Integer contextDefinitionId;
    /** Name of the context definition (transient, populated from joins). */
    private String contextName;
    /** JSON array of context constraints. */
    private String contextValuesJson;
    /** List of segment IDs to target. */
    private List<Integer> segmentIds;
    /** Name of the environment this strategy applies to (transient, populated from joins). */
    private String environmentName;
    /** When the strategy was created. */
    private Instant createdAt;
    /** When the strategy was last used (evaluated by a client). */
    private Instant lastUsedAt;
}
