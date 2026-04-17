package dev.mozhno.environments;

/**
 * SPI interface for limiting the maximum number of environments per project.
 * Provide a custom implementation to override the default limit.
 */
public interface EnvironmentLimitProvider {
    int getMaxEnvironments();
}
