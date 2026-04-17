package dev.mozhno.spi;

/**
 * Service Provider Interface for feature gating.
 * <p>
 * In the Open Core architecture, the community edition enables all features
 * unconditionally. Licensed editions can provide an SPI implementation that
 * gates premium features based on the workspace's license tier. This allows
 * a single codebase to ship both community and premium functionality without
 * compile-time conditionals.
 */
public interface FeatureGateSpi {

    /**
     * Checks whether the given feature is enabled for the workspace.
     *
     * @param workspaceId the workspace identifier
     * @param key         the feature key to check
     * @return {@code true} if the feature is enabled
     */
    boolean isFeatureEnabled(String workspaceId, FeatureKey key);

    /**
     * Enumerated set of gatable premium features.
     */
    enum FeatureKey {
        SSO,
        ADVANCED_AUDIT,
        WEBHOOKS,
        CUSTOM_BRANDING,
        TEAM_MANAGEMENT,
        ADVANCED_ANALYTICS
    }
}
