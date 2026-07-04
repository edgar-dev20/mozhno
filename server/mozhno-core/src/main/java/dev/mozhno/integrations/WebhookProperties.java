package dev.mozhno.integrations;

import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for outbound webhook delivery.
 * Bound to the {@code mozhno.webhook} prefix.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.webhook")
public class WebhookProperties {

    /** TCP connect timeout for webhook HTTP calls, in seconds. */
    @Positive
    private int connectTimeoutSeconds = 10;

    /** Per-request timeout for webhook HTTP calls, in seconds. */
    @Positive
    private int requestTimeoutSeconds = 30;

    @NestedConfigurationProperty
    private final Async async = new Async();

    @Getter
    @Setter
    public static class Async {
        @Positive
        private int corePoolSize = 4;
        @Positive
        private int maxPoolSize = 16;
        @Positive
        private int queueCapacity = 100;
    }
}
