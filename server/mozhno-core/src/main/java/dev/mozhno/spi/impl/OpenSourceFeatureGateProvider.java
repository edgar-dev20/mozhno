package dev.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import dev.mozhno.spi.FeatureGateSpi;

/**
 * Default {@link FeatureGateSpi} implementation for the open-source edition
 * that enables all features unconditionally.
 *
 * <p>Every feature gate returns {@code true} regardless of the workspace or
 * feature key. This means all features (SSO, advanced audit, webhooks, custom
 * branding, team management, and advanced analytics) are available. Licensed
 * editions may replace this with a provider that gates features based on the
 * active subscription tier.
 */
@Component
public class OpenSourceFeatureGateProvider implements FeatureGateSpi {

    /**
     * Checks whether a feature is enabled for the given workspace.
     *
     * @param workspaceId the workspace identifier
     * @param key         the feature to check (e.g. {@code SSO},
     *                    {@code ADVANCED_AUDIT}, {@code WEBHOOKS})
     * @return always {@code true}
     * @implNote The OSS implementation enables all features unconditionally.
     *           No workspace-level or tier-based gating is applied.
     */
    @Override
    public boolean isFeatureEnabled(String workspaceId, FeatureKey key) {
        return true;
    }
}
