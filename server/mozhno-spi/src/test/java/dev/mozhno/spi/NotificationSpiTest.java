package dev.mozhno.spi;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationSpiTest {

    @Test
    void notificationEventShouldStoreAllFields() {
        var event = new NotificationSpi.NotificationEvent(
            "EMAIL", "user@test.com", "Flag Updated",
            "Flag 'new-feature' has been enabled", 1);

        assertThat(event.type()).isEqualTo("EMAIL");
        assertThat(event.recipient()).isEqualTo("user@test.com");
        assertThat(event.subject()).isEqualTo("Flag Updated");
        assertThat(event.body()).isEqualTo("Flag 'new-feature' has been enabled");
        assertThat(event.projectId()).isEqualTo(1);
    }

    @Test
    void notificationEventShouldAllowNullProjectId() {
        var event = new NotificationSpi.NotificationEvent(
            "SLACK", "#general", "System Alert", "DB migration complete", null);

        assertThat(event.projectId()).isNull();
        assertThat(event.type()).isEqualTo("SLACK");
    }

    @Test
    void sendShouldBeCalledOncePerEvent() {
        var events = new java.util.ArrayList<NotificationSpi.NotificationEvent>();
        NotificationSpi notifier = events::add;

        var event = new NotificationSpi.NotificationEvent(
            "EMAIL", "to@test.com", "Subject", "Body", 1);
        notifier.send(event);

        assertThat(events).hasSize(1);
        assertThat(events.get(0)).isEqualTo(event);
    }
}
