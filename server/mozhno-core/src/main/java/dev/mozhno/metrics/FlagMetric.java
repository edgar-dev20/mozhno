package dev.mozhno.metrics;

import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/**
 * Hourly aggregated evaluation metrics for a flag.
 */
@Getter
@Setter
public class FlagMetric {
    /** Unique identifier. */
    private Long id;
    /** Project ID. */
    private Integer projectId;
    /** Flag ID. */
    private Integer flagId;
    /** Environment ID. */
    private Integer environmentId;
    /** Number of evaluations that returned true. */
    private long evaluationTrueCount;
    /** Number of evaluations that returned false. */
    private long evaluationFalseCount;
    /** The hour bucket this metric represents. */
    private Instant timeBucket;
    /** When this metric row was created. */
    private Instant createdAt;
}
