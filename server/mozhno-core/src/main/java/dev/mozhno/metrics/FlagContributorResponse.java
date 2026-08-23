package dev.mozhno.metrics;

import lombok.Builder;
import java.time.Instant;

@Builder
public record FlagContributorResponse(
    Long instanceId,
    String sdkInstanceId,
    String appName,
    String appType,
    String sdkVersion,
    Instant lastSeenAt,
    long evaluationTrueCount,
    long evaluationFalseCount
) {}
