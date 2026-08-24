package dev.mozhno.metrics;

/**
 * Usage summary of a single flag for one client application in one environment
 * over a time window: how many times the app attempted to activate the flag
 * and what the flag's environment state is.
 *
 * @param flagId the flag ID
 * @param key the flag key
 * @param name the flag name
 * @param flagType the flag type name
 * @param enabled whether the flag resolves to enabled in the environment
 * @param percentage the configured rollout percentage in the environment, or null
 * @param evaluationTrueCount summed true evaluations in the window
 * @param evaluationFalseCount summed false evaluations in the window
 * @param totalEvaluations summed evaluations in the window
 */
public record FlagUsage(
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
