package dev.mozhno.spi.impl;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OpenSourceFeatureGateProviderTest {
    @Test
    void isFeatureEnabled_shouldAlwaysReturnTrue() {
        var provider = new OpenSourceFeatureGateProvider();
        assertThat(provider.isFeatureEnabled("ws1", dev.mozhno.spi.FeatureGateSpi.FeatureKey.SSO)).isTrue();
        assertThat(provider.isFeatureEnabled("ws1", dev.mozhno.spi.FeatureGateSpi.FeatureKey.WEBHOOKS)).isTrue();
        assertThat(provider.isFeatureEnabled(null, null)).isTrue();
    }
}
