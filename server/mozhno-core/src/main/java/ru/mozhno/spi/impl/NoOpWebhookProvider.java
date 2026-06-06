package ru.mozhno.spi.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import ru.mozhno.spi.WebhookSpi;

@Component
public class NoOpWebhookProvider implements WebhookSpi {

    private static final Logger log = LoggerFactory.getLogger(NoOpWebhookProvider.class);

    @Override
    public void fire(WebhookPayload payload) {
        log.debug("Webhook skipped (no-op): event={}, projectId={}", payload.eventType(), payload.projectId());
    }
}
