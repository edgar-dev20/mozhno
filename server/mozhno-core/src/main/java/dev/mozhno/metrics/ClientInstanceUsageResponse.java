package dev.mozhno.metrics;

import lombok.Builder;

import java.util.List;

/**
 * API response for the flags a client application attempted to activate
 * in an environment over a time window.
 */
@Builder
public record ClientInstanceUsageResponse(
    String appName,
    Integer environmentId,
    int hours,
    int totalActiveFlags,
    List<FlagUsageResponse> flags
) {}
