package dev.mozhno.client;

import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for SDK client handling.
 * Bound to the {@code mozhno.client} prefix.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.client")
public class ClientProperties {

    /** Maximum number of stored metric entries per API key. */
    @Positive
    private int maxMetricsPerKey = 1000;

    /** Retention period for inactive SDK client instances, in days. */
    @Positive
    private int instanceRetentionDays = 30;
}
