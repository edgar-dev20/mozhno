package dev.mozhno.sdk;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MozhnoConfigTest {

    @Test
    void validConfig() {
        MozhnoConfig config = MozhnoConfig.builder()
            .appName("test")
            .instanceId("test-1")
            .mozhnoUrl("https://example.com")
            .apiKey("test-key")
            .build();

        assertEquals("test", config.getAppName());
        assertEquals("test-1", config.getInstanceId());
        assertEquals("https://example.com", config.getMozhnoUrl());
        assertEquals("test-key", config.getApiKey());
        assertEquals(15, config.getFetchTogglesInterval());
        assertEquals(60, config.getSendMetricsInterval());
    }

    @Test
    void missingAppNameThrows() {
        assertThrows(IllegalArgumentException.class, () ->
            MozhnoConfig.builder()
                .instanceId("test")
                .mozhnoUrl("https://example.com")
                .apiKey("test-key")
                .build());
    }

    @Test
    void customIntervals() {
        MozhnoConfig config = MozhnoConfig.builder()
            .appName("test")
            .instanceId("test-1")
            .mozhnoUrl("https://example.com")
            .apiKey("test-key")
            .fetchTogglesInterval(30)
            .sendMetricsInterval(120)
            .build();

        assertEquals(30, config.getFetchTogglesInterval());
        assertEquals(120, config.getSendMetricsInterval());
    }
}
