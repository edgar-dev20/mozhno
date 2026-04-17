package dev.mozhno.audit;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.spi.QuotaSpi;

import java.util.List;

/**
 * Service for recording and querying audit log events.
 * Includes a scheduled job to purge events older than the configured retention period.
 */
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

    /**
     * Returns all audit events for a project, limited to the most recent 500.
     *
     * @param projectId the project ID
     * @return list of audit events
     */
    public List<AuditEvent> findByProjectId(Integer projectId) {
        return repository.findByProjectId(projectId);
    }

    /**
     * Returns paginated audit events for a project with optional date filtering.
     *
     * @param projectId the project ID
     * @param page      zero-based page number
     * @param size      page size
     * @param dateFrom  optional start date (ISO: yyyy-MM-dd)
     * @param dateTo    optional end date (ISO: yyyy-MM-dd)
     * @return list of audit events for the requested page
     */
    public List<AuditEvent> findByProjectId(Integer projectId, int page, int size, String dateFrom, String dateTo) {
        int offset = page * size;
        return repository.findByProjectId(projectId, size, offset, dateFrom, dateTo);
    }

    /**
     * Records an audit event.
     *
     * @param projectId the project ID, may be null for system events
     * @param userId the user ID, may be null
     * @param userName the user name
     * @param userEmail the user email
     * @param action the action performed
     * @param resourceType the type of resource affected
     * @param resourceId the resource ID, may be null
     * @param resourceName the resource name
     * @param details additional details
     * @param ipAddress the IP address of the user, may be null
     * @return the recorded audit event
     */
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

    /**
     * Scheduled task that purges audit events older than the configured retention period.
     * Runs daily at 3:00 AM.
     */
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