package dev.mozhno.config;

import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for the metrics async executor.
 * Bound to the {@code mozhno.metrics.async} prefix.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.metrics.async")
public class MetricsAsyncProperties {

    @NestedConfigurationProperty
    private final Pool pool = new Pool();

    @Getter
    @Setter
    public static class Pool {
        @Positive
        private int coreSize = 2;
        @Positive
        private int maxSize = 4;
        @Positive
        private int queueCapacity = 500;
    }
}
