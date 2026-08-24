package dev.mozhno.metrics;

import lombok.Builder;

/**
 * API response for a single flag's usage summary by a client application.
 */
@Builder
public record FlagUsageResponse(
    Integer flagId,
    String key,
    String name,
    String flagType,
    boolean enabled,
    Integer percentage,
    long evaluationTrueCount,
    long evaluationFalseCount,
    long totalEvaluations
) {}
