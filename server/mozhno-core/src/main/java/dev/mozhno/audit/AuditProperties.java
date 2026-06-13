package dev.mozhno.audit;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for audit log retention.
 * Bound to the {@code audit} configuration prefix.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "audit")
public class AuditProperties {
    private int retentionDays = 365;
}
