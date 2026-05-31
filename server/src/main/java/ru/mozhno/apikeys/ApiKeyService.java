package ru.mozhno.apikeys;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.projects.ProjectRepository;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
public class ApiKeyService {
    private final ApiKeyRepository apiKeyRepository;
    private final ProjectRepository projectRepository;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public ApiKeyService(ApiKeyRepository apiKeyRepository, ProjectRepository projectRepository) {
        this.apiKeyRepository = apiKeyRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<ApiKey> findByProjectId(Integer projectId) {
        if (projectRepository.findById(projectId) == null) {
            throw new RuntimeException("Project not found: " + projectId);
        }
        return apiKeyRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public ApiKey findById(Integer id) {
        ApiKey k = apiKeyRepository.findById(id);
        if (k == null) throw new RuntimeException("ApiKey not found: " + id);
        return k;
    }

    @Transactional(readOnly = true)
    public ApiKey findByApiKey(String apiKey) {
        return apiKeyRepository.findByApiKey(apiKey);
    }

    @Transactional
    public ApiKey create(Integer projectId, ApiKeyRequest request) {
        if (projectRepository.findById(projectId) == null) {
            throw new RuntimeException("Project not found: " + projectId);
        }
        ApiKey k = new ApiKey();
        k.setProjectId(projectId);
        k.setName(request.getName());
        k.setEnvironmentId(request.getEnvironmentId());
        k.setDescription(request.getDescription());
        k.setApiKey(generateApiKey());
        return apiKeyRepository.save(k);
    }

    @Transactional
    public ApiKey update(Integer id, ApiKeyRequest request) {
        ApiKey k = apiKeyRepository.findById(id);
        if (k == null) throw new RuntimeException("ApiKey not found: " + id);
        k.setName(request.getName());
        k.setEnvironmentId(request.getEnvironmentId());
        k.setDescription(request.getDescription());
        return apiKeyRepository.save(k);
    }

    @Transactional
    public void delete(Integer id) {
        apiKeyRepository.deleteById(id);
    }

    @Transactional
    public void updateLastUsed(Integer id) {
        apiKeyRepository.updateLastUsed(id);
    }

    private String generateApiKey() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}