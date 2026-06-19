package dev.mozhno.events;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import dev.mozhno.spi.AuditSpi;
import dev.mozhno.spi.AuditEventEnricher;

@Component
public class AuditEventListener {
    private final AuditSpi auditSpi;
    private final AuditEventEnricher enricher;

    public AuditEventListener(AuditSpi auditSpi, AuditEventEnricher enricher) {
        this.auditSpi = auditSpi;
        this.enricher = enricher;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDomainEvent(DomainEvent event) {
        Integer userId = event.userId();
        String userName = event.userName() != null ? event.userName() : "system";
        String userEmail = event.userEmail() != null ? event.userEmail() : "system";

        String ip = resolveIp();

        AuditSpi.AuditRecord record = new AuditSpi.AuditRecord(
            event.projectId(), userId, userName, userEmail, event.action(),
            event.resourceType(), event.resourceId(), event.resourceName(),
            event.details(), ip);

        String enrichedDetails = enricher.enrich(record);
        if (enrichedDetails != null && !enrichedDetails.equals(record.details())) {
            record = new AuditSpi.AuditRecord(
                record.projectId(), record.userId(), record.userName(), record.userEmail(),
                record.action(), record.resourceType(), record.resourceId(), record.resourceName(),
                enrichedDetails, record.ipAddress());
        }

        auditSpi.log(record);
    }

    private String resolveIp() {
        return dev.mozhno.util.HttpUtils.getClientIpFromCurrentRequest();
    }
}
