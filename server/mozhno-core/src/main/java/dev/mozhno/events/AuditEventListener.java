package dev.mozhno.events;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import dev.mozhno.spi.AuditSpi;

@Component
public class AuditEventListener {
    private final AuditSpi auditSpi;

    public AuditEventListener(AuditSpi auditSpi) {
        this.auditSpi = auditSpi;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDomainEvent(DomainEvent event) {
        Integer userId = event.userId();
        String userName = event.userName() != null ? event.userName() : "system";
        String userEmail = event.userEmail() != null ? event.userEmail() : "system";

        String ip = resolveIp();

        auditSpi.log(new AuditSpi.AuditRecord(
            event.projectId(), userId, userName, userEmail, event.action(),
            event.resourceType(), event.resourceId(), event.resourceName(),
            event.details(), ip));
    }

    private String resolveIp() {
        return dev.mozhno.util.HttpUtils.getClientIpFromCurrentRequest();
    }
}
