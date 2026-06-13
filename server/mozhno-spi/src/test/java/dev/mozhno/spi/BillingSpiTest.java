package dev.mozhno.spi;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BillingSpiTest {

    @Test
    void planInfoShouldStoreAllFields() {
        var plan = new BillingSpi.PlanInfo("ENTERPRISE", 50, 200);

        assertThat(plan.tier()).isEqualTo("ENTERPRISE");
        assertThat(plan.memberLimit()).isEqualTo(50);
        assertThat(plan.flagLimit()).isEqualTo(200);
    }

    @Test
    void planInfoShouldAllowStarterPlan() {
        var plan = new BillingSpi.PlanInfo("STARTER", 5, 10);

        assertThat(plan.tier()).isEqualTo("STARTER");
        assertThat(plan.memberLimit()).isEqualTo(5);
        assertThat(plan.flagLimit()).isEqualTo(10);
    }

    @Test
    void isFeatureAllowedShouldBeCalledPerWorkspace() {
        var billing = new StubBillingProvider(true);
        assertThat(billing.isFeatureAllowed("ws1", "premium-audit")).isTrue();
        assertThat(billing.isFeatureAllowed("ws2", "premium-audit")).isTrue();
    }

    @Test
    void isFeatureAllowedShouldReturnFalseWhenBlocked() {
        var billing = new StubBillingProvider(false);
        assertThat(billing.isFeatureAllowed("ws1", "premium-audit")).isFalse();
    }

    @Test
    void getPlanShouldReturnConfiguredPlan() {
        var plan = new BillingSpi.PlanInfo("PRO", 10, 50);
        var billing = new StubBillingProvider(true, plan);
        assertThat(billing.getPlan("ws1")).isEqualTo(plan);
    }

    private static class StubBillingProvider implements BillingSpi {
        private final boolean allowed;
        private final PlanInfo plan;

        StubBillingProvider(boolean allowed) {
            this(allowed, new PlanInfo("FREE", 0, 0));
        }

        StubBillingProvider(boolean allowed, PlanInfo plan) {
            this.allowed = allowed;
            this.plan = plan;
        }

        @Override
        public boolean isFeatureAllowed(String workspaceId, String featureKey) {
            return allowed;
        }

        @Override
        public PlanInfo getPlan(String workspaceId) {
            return plan;
        }
    }
}
