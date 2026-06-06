package ru.mozhno.spi;

import java.util.Map;

public interface WebhookSpi {

    void fire(WebhookPayload payload);

    record WebhookPayload(
        String eventType,
        Integer projectId,
        Map<String, Object> data
    ) {}
}
