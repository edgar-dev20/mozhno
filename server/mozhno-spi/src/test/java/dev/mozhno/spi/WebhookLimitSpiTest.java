package dev.mozhno.spi;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WebhookLimitSpiTest {

    @Test
    void unlimitedShouldReturnMaxValue() {
        WebhookLimitSpi unlimited = new WebhookLimitSpi() {
            @Override
            public long getRemaining(int projectId) { return Long.MAX_VALUE; }
            @Override
            public boolean tryConsume(int projectId) { return true; }
        };

        assertThat(unlimited.getRemaining(1)).isEqualTo(Long.MAX_VALUE);
        assertThat(unlimited.getRemaining(42)).isEqualTo(Long.MAX_VALUE);
    }

    @Test
    void tryConsumeShouldReturnFalseWhenExhausted() {
        WebhookLimitSpi exhausted = new WebhookLimitSpi() {
            @Override
            public long getRemaining(int projectId) { return 0; }

            @Override
            public boolean tryConsume(int projectId) { return false; }
        };

        assertThat(exhausted.getRemaining(1)).isEqualTo(0);
        assertThat(exhausted.tryConsume(1)).isFalse();
    }

    @Test
    void tryConsumeShouldReturnTrueWhenQuotaAvailable() {
        WebhookLimitSpi available = new WebhookLimitSpi() {
            @Override
            public long getRemaining(int projectId) { return 100; }

            @Override
            public boolean tryConsume(int projectId) { return true; }
        };

        assertThat(available.getRemaining(1)).isEqualTo(100);
        assertThat(available.tryConsume(1)).isTrue();
    }

    @Test
    void getRemainingShouldDecreaseAfterConsumption() {
        var counter = new int[]{5};
        WebhookLimitSpi provider = new WebhookLimitSpi() {
            @Override
            public long getRemaining(int projectId) { return counter[0]; }

            @Override
            public boolean tryConsume(int projectId) {
                if (counter[0] > 0) {
                    counter[0]--;
                    return true;
                }
                return false;
            }
        };

        assertThat(provider.getRemaining(1)).isEqualTo(5);
        assertThat(provider.tryConsume(1)).isTrue();
        assertThat(provider.getRemaining(1)).isEqualTo(4);
    }
}
