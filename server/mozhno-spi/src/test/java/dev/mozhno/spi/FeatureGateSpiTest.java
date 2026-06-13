package dev.mozhno.spi;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FeatureGateSpiTest {

    @Test
    void featureKeysShouldContainAllGateableFeatures() {
        assertThat(FeatureGateSpi.FeatureKey.values()).containsExactlyInAnyOrder(
            FeatureGateSpi.FeatureKey.SSO,
            FeatureGateSpi.FeatureKey.ADVANCED_AUDIT,
            FeatureGateSpi.FeatureKey.WEBHOOKS,
            FeatureGateSpi.FeatureKey.CUSTOM_BRANDING,
            FeatureGateSpi.FeatureKey.TEAM_MANAGEMENT,
            FeatureGateSpi.FeatureKey.ADVANCED_ANALYTICS
        );
    }

    @Test
    void featureKeyNameShouldBeStable() {
        assertThat(FeatureGateSpi.FeatureKey.SSO.name()).isEqualTo("SSO");
        assertThat(FeatureGateSpi.FeatureKey.WEBHOOKS.name()).isEqualTo("WEBHOOKS");
        assertThat(FeatureGateSpi.FeatureKey.ADVANCED_AUDIT.name()).isEqualTo("ADVANCED_AUDIT");
    }

    @Test
    void isFeatureEnabledShouldBeCheckedPerWorkspace() {
        var gate = new StubFeatureGate(true);
        assertThat(gate.isFeatureEnabled("ws1", FeatureGateSpi.FeatureKey.SSO)).isTrue();
        assertThat(gate.isFeatureEnabled("ws2", FeatureGateSpi.FeatureKey.WEBHOOKS)).isTrue();
    }

    @Test
    void isFeatureEnabledShouldReturnFalseWhenDisabled() {
        var gate = new StubFeatureGate(false);
        assertThat(gate.isFeatureEnabled("ws1", FeatureGateSpi.FeatureKey.SSO)).isFalse();
    }

    @Test
    void featureKeyValueOfShouldWork() {
        assertThat(FeatureGateSpi.FeatureKey.valueOf("SSO")).isEqualTo(FeatureGateSpi.FeatureKey.SSO);
        assertThat(FeatureGateSpi.FeatureKey.valueOf("CUSTOM_BRANDING"))
            .isEqualTo(FeatureGateSpi.FeatureKey.CUSTOM_BRANDING);
    }

    private static class StubFeatureGate implements FeatureGateSpi {
        private final boolean enabled;

        StubFeatureGate(boolean enabled) {
            this.enabled = enabled;
        }

        @Override
        public boolean isFeatureEnabled(String workspaceId, FeatureKey key) {
            return enabled;
        }
    }
}
