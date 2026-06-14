package dev.mozhno.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientInstanceService {
    private static final Logger log = LoggerFactory.getLogger(ClientInstanceService.class);
    private final ClientInstanceRepository repository;

    public ClientInstanceService(ClientInstanceRepository repository) {
        this.repository = repository;
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
        int deleted = repository.deleteOlderThan(30);
        if (deleted > 0) {
            log.info("Purged {} client instances older than 30 days", deleted);
        }
    }
}
