package dev.mozhno.audit;

import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for audit log retention.
 * Bound to the {@code mozhno.audit} configuration prefix.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.audit")
public class AuditProperties {
    @Positive
    private int retentionDays = 365;
}
