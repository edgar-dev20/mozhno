package dev.mozhno.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientInstanceService {
    private static final Logger log = LoggerFactory.getLogger(ClientInstanceService.class);
    private static final int DEFAULT_RETENTION_DAYS = 30;

    private final ClientInstanceRepository repository;
    private final int retentionDays;

    public ClientInstanceService(ClientInstanceRepository repository,
                                 @Value("${app.client-instance.retention-days:30}") int retentionDays) {
        this.repository = repository;
        this.retentionDays = retentionDays > 0 ? retentionDays : DEFAULT_RETENTION_DAYS;
    }

    public Long record(Integer projectId, Integer environmentId, Integer apiKeyId,
                       String appName, String instanceId, String appType, String keyType) {
        return record(projectId, environmentId, apiKeyId, appName, instanceId, appType, null, keyType);
    }

    public Long record(Integer projectId, Integer environmentId, Integer apiKeyId,
                       String appName, String instanceId, String appType, String sdkVersion, String keyType) {
        if (appName == null || instanceId == null) return null;
        return repository.upsert(projectId, environmentId, apiKeyId, appName, instanceId, appType, sdkVersion, keyType);
    }

    public List<ClientInstance> getInstances(Integer projectId, Integer environmentId) {
        if (environmentId != null) {
            return repository.findByProjectIdAndEnvironmentId(projectId, environmentId);
        }
        return repository.findByProjectId(projectId);
    }

    @Scheduled(cron = "0 30 3 * * ?")
    public void purgeOldInstances() {
        int deleted = repository.deleteOlderThan(retentionDays);
        if (deleted > 0) {
            log.info("Purged {} client instances older than {} days", deleted, retentionDays);
        }
    }
}
