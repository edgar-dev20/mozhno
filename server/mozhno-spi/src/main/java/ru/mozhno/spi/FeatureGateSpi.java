package ru.mozhno.spi;

public interface FeatureGateSpi {

    boolean isFeatureEnabled(String workspaceId, FeatureKey key);

    enum FeatureKey {
        SSO,
        ADVANCED_AUDIT,
        WEBHOOKS,
        CUSTOM_BRANDING,
        TEAM_MANAGEMENT,
        ADVANCED_ANALYTICS
    }
}
