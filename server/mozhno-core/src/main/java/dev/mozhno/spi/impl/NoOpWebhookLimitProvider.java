package dev.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import dev.mozhno.spi.WebhookLimitSpi;

/**
 * Community edition: no webhook delivery limits.
 */
@Component
public class NoOpWebhookLimitProvider implements WebhookLimitSpi {

    @Override
    public long getRemaining(int projectId) {
        return Long.MAX_VALUE;
    }

    @Override
    public boolean tryConsume(int projectId) {
        return true;
    }
}
