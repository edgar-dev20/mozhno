package ru.mozhno.spi;

import java.time.Instant;

public interface AuditSpi {

    void log(AuditRecord record);

    record AuditRecord(
        Integer projectId,
        Integer userId,
        String userName,
        String userEmail,
        String action,
        String resourceType,
        Integer resourceId,
        String resourceName,
        String details,
        String ipAddress
    ) {}
}
