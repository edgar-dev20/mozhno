package dev.mozhno.metrics;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Positive;

/**
 * Configuration properties for flag evaluation metric retention.
 * Bound to the {@code mozhno.metrics} configuration prefix.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.metrics")
public class MetricsProperties {

    /** Retention period for flag evaluation metric rows, in days. */
    @Positive
    private int retentionDays = 90;
}
