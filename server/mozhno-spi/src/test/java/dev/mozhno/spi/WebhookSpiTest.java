package dev.mozhno.spi;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class WebhookSpiTest {

    @Test
    void webhookPayloadShouldStoreAllFields() {
        var data = Map.<String, Object>of("flagKey", "new-feature", "enabled", true);
        var payload = new WebhookSpi.WebhookPayload("flag.updated", 1, data);

        assertThat(payload.eventType()).isEqualTo("flag.updated");
        assertThat(payload.projectId()).isEqualTo(1);
        assertThat(payload.data()).isEqualTo(data);
    }

    @Test
    void webhookPayloadShouldAllowNullProjectId() {
        var payload = new WebhookSpi.WebhookPayload("system.startup", null, Map.of());

        assertThat(payload.eventType()).isEqualTo("system.startup");
        assertThat(payload.projectId()).isNull();
    }

    @Test
    void fireShouldBeCalledOncePerEvent() {
        var events = new java.util.ArrayList<WebhookSpi.WebhookPayload>();
        WebhookSpi webhook = events::add;

        var payload = new WebhookSpi.WebhookPayload("flag.archived", 1, Map.of("key", "old-feature"));
        webhook.fire(payload);

        assertThat(events).hasSize(1);
        assertThat(events.get(0).eventType()).isEqualTo("flag.archived");
    }
}
