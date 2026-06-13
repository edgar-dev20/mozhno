package dev.mozhno.spi.impl;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OpenSourceBillingProviderTest {
    @Test
    void isFeatureAllowed_shouldAlwaysReturnTrue() {
        var provider = new OpenSourceBillingProvider();
        assertThat(provider.isFeatureAllowed("ws1", "any-feature")).isTrue();
        assertThat(provider.isFeatureAllowed(null, null)).isTrue();
    }

    @Test
    void getPlan_shouldReturnOpenSourcePlan() {
        var provider = new OpenSourceBillingProvider();
        var plan = provider.getPlan("ws1");
        assertThat(plan.tier()).isEqualTo("open-source");
        assertThat(plan.memberLimit()).isEqualTo(Integer.MAX_VALUE);
        assertThat(plan.flagLimit()).isEqualTo(Integer.MAX_VALUE);
    }
}
