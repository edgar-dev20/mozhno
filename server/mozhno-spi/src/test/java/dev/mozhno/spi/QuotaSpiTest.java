package dev.mozhno.spi;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class QuotaSpiTest {

    @Test
    void allowedShouldBeSingleton() {
        var a1 = new QuotaSpi.Allowed();
        var a2 = new QuotaSpi.Allowed();
        assertThat(a1).isEqualTo(a2);
    }

    @Test
    void blockedShouldStoreAllFields() {
        var blocked = new QuotaSpi.Blocked("FLAG", 10, 10, "STARTER");

        assertThat(blocked.resourceType()).isEqualTo("FLAG");
        assertThat(blocked.current()).isEqualTo(10);
        assertThat(blocked.limit()).isEqualTo(10);
        assertThat(blocked.planName()).isEqualTo("STARTER");
    }

    @Test
    void canCreateFlagShouldBeCalledPerProject() {
        var quota = new StubQuotaProvider(true);
        assertThat(quota.canCreateFlag(1)).isInstanceOf(QuotaSpi.Allowed.class);
        assertThat(quota.canCreateFlag(2)).isInstanceOf(QuotaSpi.Allowed.class);
    }

    @Test
    void canCreateSegmentShouldBeBlockedWhenQuotaFull() {
        var quota = new StubQuotaProvider(false);
        var result = quota.canCreateSegment(1);
        assertThat(result).isInstanceOf(QuotaSpi.Blocked.class);
        var blocked = (QuotaSpi.Blocked) result;
        assertThat(blocked.resourceType()).isEqualTo("SEGMENT");
    }

    @Test
    void getAuditRetentionDaysShouldReturnConfiguredValue() {
        var quota = new StubQuotaProvider(true);
        assertThat(quota.getAuditRetentionDays(1)).isEqualTo(365);
    }

    @Test
    void allMethodsShouldBeBlockedWhenQuotaFull() {
        var quota = new StubQuotaProvider(false);
        assertThat(quota.canCreateFlag(1)).isInstanceOf(QuotaSpi.Blocked.class);
        assertThat(quota.canCreateSegment(1)).isInstanceOf(QuotaSpi.Blocked.class);
        assertThat(quota.canCreateContext(1)).isInstanceOf(QuotaSpi.Blocked.class);
        assertThat(quota.canCreateUser(1)).isInstanceOf(QuotaSpi.Blocked.class);
        assertThat(quota.canCreateApiKey(1)).isInstanceOf(QuotaSpi.Blocked.class);
    }

    private static class StubQuotaProvider implements QuotaSpi {
        private final boolean allowed;

        StubQuotaProvider(boolean allowed) {
            this.allowed = allowed;
        }

        @Override
        public QuotaResult canCreateFlag(Integer projectId) {
            return allowed ? new Allowed() : new Blocked("FLAG", 10, 10, "STARTER");
        }

        @Override
        public QuotaResult canCreateSegment(Integer projectId) {
            return allowed ? new Allowed() : new Blocked("SEGMENT", 5, 5, "STARTER");
        }

        @Override
        public QuotaResult canCreateContext(Integer projectId) {
            return allowed ? new Allowed() : new Blocked("CONTEXT", 3, 3, "STARTER");
        }

        @Override
        public QuotaResult canCreateUser(Integer projectId) {
            return allowed ? new Allowed() : new Blocked("USER", 1, 1, "STARTER");
        }

        @Override
        public QuotaResult canCreateApiKey(Integer projectId) {
            return allowed ? new Allowed() : new Blocked("API_KEY", 5, 5, "STARTER");
        }

        @Override
        public int getAuditRetentionDays(Integer projectId) {
            return 365;
        }
    }
}
