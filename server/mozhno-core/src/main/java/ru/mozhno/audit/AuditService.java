package ru.mozhno.audit;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.spi.QuotaSpi;

import java.util.List;

@Service
@Transactional
public class AuditService {
    private final AuditEventRepository repository;
    private final AuditProperties auditProperties;
    private final QuotaSpi quotaSpi;

    public AuditService(AuditEventRepository repository, AuditProperties auditProperties, QuotaSpi quotaSpi) {
        this.repository = repository;
        this.auditProperties = auditProperties;
        this.quotaSpi = quotaSpi;
    }

    public List<AuditEvent> findByProjectId(Integer projectId) {
        return repository.findByProjectId(projectId);
    }

    public AuditEvent log(Integer projectId, Integer userId, String userName, String userEmail,
                          String action, String resourceType, Integer resourceId,
                          String resourceName, String details, String ipAddress) {
        AuditEvent event = new AuditEvent();
        event.setProjectId(projectId);
        event.setUserId(userId);
        event.setUserName(userName);
        event.setUserEmail(userEmail);
        event.setAction(action);
        event.setResourceType(resourceType);
        event.setResourceId(resourceId);
        event.setResourceName(resourceName);
        event.setDetails(details);
        event.setIpAddress(ipAddress);
        return repository.save(event);
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void purgeOldEvents() {
        int retentionDays = quotaSpi.getAuditRetentionDays(null);
        int deleted = repository.deleteOlderThan(retentionDays);
        if (deleted > 0) {
            log(null, null, "system", "system", "audit.purged",
                "audit", null, "retention: " + retentionDays + "d",
                "deleted " + deleted + " events", null);
        }
    }
}