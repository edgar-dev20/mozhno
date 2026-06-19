package dev.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import dev.mozhno.spi.AuditEventEnricher;
import dev.mozhno.spi.AuditSpi.AuditRecord;

/**
 * Default {@link AuditEventEnricher} implementation for the open-source edition
 * that returns audit details unchanged.
 *
 * <p>Licensed editions may replace this with a provider that enriches details
 * with a diff of the changed resource fields before storage.
 */
@Component
public class NoOpAuditEventEnricher implements AuditEventEnricher {

    @Override
    public String enrich(AuditRecord record) {
        return record.details();
    }
}
