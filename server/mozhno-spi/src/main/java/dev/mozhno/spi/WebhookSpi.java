package dev.mozhno.spi;

import java.util.Map;

/**
 * Service Provider Interface for outbound webhook delivery.
 * <p>
 * In the Open Core architecture, the community edition provides a basic
 * HTTP POST dispatcher with retry logic. Licensed editions can provide an
 * SPI implementation that adds guaranteed delivery via message queues,
 * custom signing (e.g. HMAC), batching, or integration with third-party
 * automation platforms.
 */
public interface WebhookSpi {

    /**
     * Dispatches a webhook payload to the configured destination(s).
     *
     * @param payload the webhook event to deliver
     */
    void fire(WebhookPayload payload);

    /**
     * A webhook event payload to be delivered to a subscriber.
     *
     * @param eventType the event type (e.g. {@code "flag.updated"}, {@code "flag.archived"})
     * @param projectId the project in which the event occurred
     * @param data      the event-specific payload data
     */
    record WebhookPayload(
        String eventType,
        Integer projectId,
        Map<String, Object> data
    ) {}
}
