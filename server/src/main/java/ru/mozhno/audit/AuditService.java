package ru.mozhno.audit;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuditService {
    private final AuditEventRepository repository;
    private final AuditProperties auditProperties;

    public AuditService(AuditEventRepository repository, AuditProperties auditProperties) {
        this.repository = repository;
        this.auditProperties = auditProperties;
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
        int deleted = repository.deleteOlderThan(auditProperties.getRetentionDays());
        if (deleted > 0) {
            log(null, null, "system", "system", "audit.purged",
                "audit", null, "retention: " + auditProperties.getRetentionDays() + "d",
                "deleted " + deleted + " events", null);
        }
    }
}