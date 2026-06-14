package dev.mozhno.metrics;

import lombok.Builder;
import java.time.Instant;

@Builder
public record FlagMetricResponse(
    Long id,
    Integer projectId,
    Integer flagId,
    Integer environmentId,
    long evaluationTrueCount,
    long evaluationFalseCount,
    Long clientInstanceId,
    Instant timeBucket,
    Instant createdAt
) {}
