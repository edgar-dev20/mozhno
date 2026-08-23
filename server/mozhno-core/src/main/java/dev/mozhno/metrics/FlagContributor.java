package dev.mozhno.metrics;

import java.time.Instant;

/**
 * Contribution summary of a single client instance to a flag's evaluation metrics
 * over the last 48 hours.
 *
 * @param instanceId       the client_instances.id (used for per-instance metric filtering)
 * @param sdkInstanceId    the client_instances.instance_id sent by the SDK
 * @param appName          the application the instance belongs to
 * @param appType          the SDK language/type of the instance
 * @param sdkVersion       the SDK version reported by the instance
 * @param lastSeenAt       the last time the instance contacted the server
 * @param evaluationTrueCount  summed true evaluations in the window
 * @param evaluationFalseCount summed false evaluations in the window
 */
public record FlagContributor(
    Long instanceId,
    String sdkInstanceId,
    String appName,
    String appType,
    String sdkVersion,
    Instant lastSeenAt,
    long evaluationTrueCount,
    long evaluationFalseCount
) {
    /** Total evaluations contributed by this instance in the window. */
    public long totalEvaluations() {
        return evaluationTrueCount + evaluationFalseCount;
    }
}
