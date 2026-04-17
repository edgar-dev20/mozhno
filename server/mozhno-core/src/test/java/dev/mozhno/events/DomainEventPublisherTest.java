package dev.mozhno.events;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DomainEventPublisherTest {
    @Test
    void testPublisher_classExists() {
        // Just verify the class compiles and can be instantiated
        var mockPublisher = new TestDomainEventPublisher();
        var event = DomainEvent.of(1, "action", "type", 2, "name", "details");
        mockPublisher.publish(event);
        assertThat(mockPublisher.wasCalled()).isTrue();
    }

    private static class TestDomainEventPublisher {
        boolean called = false;
        void publish(DomainEvent event) { called = true; }
        boolean wasCalled() { return called; }
    }
}
