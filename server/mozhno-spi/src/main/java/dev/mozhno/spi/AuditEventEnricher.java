package dev.mozhno.spi;

import dev.mozhno.spi.AuditSpi.AuditRecord;

/**
 * Service Provider Interface for enriching audit event details before persistence.
 * <p>
 * Called by the audit infrastructure during {@code DomainEvent → AuditRecord}
 * conversion. The default open-source implementation returns the original
 * details unchanged. Licensed editions can inject a provider that computes
 * a human-readable diff (old → new values) by querying the previous resource
 * state and appending it to the details.
 * <p>
 * Example SaaS enrichment result:
 * <pre>{@code "Environment: Production | enabled: false → true"}</pre>
 */
@FunctionalInterface
public interface AuditEventEnricher {

    /**
     * Enriches the details string for the given audit record.
     *
     * @param record the audit record being persisted
     * @return the enriched details string to store (must not be null)
     */
    String enrich(AuditRecord record);
}
