package dev.mozhno.events;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DomainEventTest {
    @Test
    void recordCreation_shouldSetAllFields() {
        DomainEvent event = DomainEvent.of(1, "flag.created", "flag", 42, "My Flag", "details here");

        assertThat(event.projectId()).isEqualTo(1);
        assertThat(event.action()).isEqualTo("flag.created");
        assertThat(event.resourceType()).isEqualTo("flag");
        assertThat(event.resourceId()).isEqualTo(42);
        assertThat(event.resourceName()).isEqualTo("My Flag");
        assertThat(event.details()).isEqualTo("details here");
    }

    @Test
    void nullFields_shouldWork() {
        DomainEvent event = DomainEvent.of(null, "action", "type", null, null, null);

        assertThat(event.projectId()).isNull();
        assertThat(event.resourceId()).isNull();
        assertThat(event.resourceName()).isNull();
        assertThat(event.details()).isNull();
    }

    @Test
    void testEquality() {
        var e1 = DomainEvent.of(1, "a", "t", 1, "n", "d");
        var e2 = DomainEvent.of(1, "a", "t", 1, "n", "d");
        assertThat(e1).isEqualTo(e2);
    }
}
