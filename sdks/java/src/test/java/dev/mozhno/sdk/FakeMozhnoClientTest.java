package dev.mozhno.sdk;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class FakeMozhnoClientTest {

    @Test
    void enableAll() {
        FakeMozhnoClient client = new FakeMozhnoClient();
        client.enableAll();

        assertTrue(client.isEnabled("any-feature"));
        assertTrue(client.isEnabled("another"));
    }

    @Test
    void enableSpecific() {
        FakeMozhnoClient client = new FakeMozhnoClient();
        client.enable("feature-a", "feature-b");

        assertTrue(client.isEnabled("feature-a"));
        assertTrue(client.isEnabled("feature-b"));
        assertFalse(client.isEnabled("feature-c"));
    }

    @Test
    void defaultReturn() {
        FakeMozhnoClient client = new FakeMozhnoClient();
        assertFalse(client.isEnabled("unknown"));
        assertTrue(client.isEnabled("unknown", true));
    }

    @Test
    void disableOverride() {
        FakeMozhnoClient client = new FakeMozhnoClient();
        client.enable("feature-a");
        client.disable("feature-a");

        assertFalse(client.isEnabled("feature-a"));
    }
}
