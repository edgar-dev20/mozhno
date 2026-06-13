package dev.mozhno.client;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientInstanceService {
    private final ClientInstanceRepository repository;

    public ClientInstanceService(ClientInstanceRepository repository) {
        this.repository = repository;
    }

    public void record(Integer projectId, Integer environmentId, Integer apiKeyId,
                       String appName, String instanceId, String appType, String keyType) {
        if (appName == null || instanceId == null) return;
        repository.upsert(projectId, environmentId, apiKeyId, appName, instanceId, appType, keyType);
    }

    public List<ClientInstance> getInstances(Integer projectId, Integer environmentId) {
        if (environmentId != null) {
            return repository.findByProjectIdAndEnvironmentId(projectId, environmentId);
        }
        return repository.findByProjectId(projectId);
    }
}
