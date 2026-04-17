package dev.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import dev.mozhno.audit.AuditService;
import dev.mozhno.spi.AuditSpi;

/**
 * Default {@link AuditSpi} implementation that persists audit records to a
 * relational database via {@link AuditService}.
 *
 * <p>This is the community-edition audit provider. Each audit event is written
 * synchronously to the configured database through Spring Data JDBC. Licensed
 * editions may replace this with a provider that forwards events to an external
 * SIEM or messaging system.
 */
@Component
public class JdbcAuditProvider implements AuditSpi {

    private final AuditService auditService;

    public JdbcAuditProvider(AuditService auditService) {
        this.auditService = auditService;
    }

    /**
     * Persists the given audit record to the database.
     *
     * @param record the audit event containing the actor, action, resource,
     *               and originating IP address
     * @implNote Delegates synchronously to {@link AuditService#log}, which
     *           writes directly to the PostgreSQL audit table.
     */
    @Override
    public void log(AuditRecord record) {
        auditService.log(
            record.projectId(),
            record.userId(),
            record.userName(),
            record.userEmail(),
            record.action(),
            record.resourceType(),
            record.resourceId(),
            record.resourceName(),
            record.details(),
            record.ipAddress()
        );
    }
}
