package ru.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import ru.mozhno.audit.AuditService;
import ru.mozhno.spi.AuditSpi;

@Component
public class JdbcAuditProvider implements AuditSpi {

    private final AuditService auditService;

    public JdbcAuditProvider(AuditService auditService) {
        this.auditService = auditService;
    }

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
