package dev.mozhno.apikeys;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.environments.EnvironmentRepository;

import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.NotFoundException;

import java.util.List;

import static dev.mozhno.client.HashUtils.generateRawToken;

/**
 * Service for managing project API keys used for SDK authentication.
 * Keys are generated with a cryptographically secure random token.
 */
@Service
public class ApiKeyService {
    private final ApiKeyRepository apiKeyRepository;
    private final DomainEventPublisher events;
    private final QuotaSpi quotaSpi;
    private final EnvironmentRepository environmentRepository;

    public ApiKeyService(ApiKeyRepository apiKeyRepository,
                         DomainEventPublisher events, QuotaSpi quotaSpi,
                         EnvironmentRepository environmentRepository) {
        this.apiKeyRepository = apiKeyRepository;
        this.events = events;
        this.quotaSpi = quotaSpi;
        this.environmentRepository = environmentRepository;
    }

    /**
     * Returns all API keys for a project.
     *
     * @param projectId the project ID
     * @return list of API keys
     * @throws RuntimeException if the project is not found
     */
    @Transactional(readOnly = true)
    public List<ApiKey> findByProjectId(Integer projectId) {
        return apiKeyRepository.findByProjectId(projectId);
    }

    /**
     * Finds an API key by its internal ID.
     *
     * @param id the API key ID
     * @return the API key
     * @throws RuntimeException if not found
     */
    @Transactional(readOnly = true)
    public ApiKey findById(Integer id, Integer projectId) {
        ApiKey k = apiKeyRepository.findByIdAndProjectId(id, projectId);
        if (k == null) throw new NotFoundException("ApiKey", id);
        return k;
    }

    /**
     * Finds an API key by its token string.
     *
     * @param apiKey the API key token
     * @return the API key, or null if not found
     */
    @Transactional(readOnly = true)
    public ApiKey findByApiKey(String apiKey) {
        return apiKeyRepository.findByApiKey(apiKey);
    }

    /**
     * Creates a new API key with a secure random token.
     *
     * @param projectId the project ID
     * @param request the API key creation request
     * @return the created API key
     * @throws RuntimeException if the project is not found or quota is exceeded
     */
    @Transactional
    public ApiKey create(Integer projectId, ApiKeyRequest request) {
        dev.mozhno.util.QuotaValidator.check(quotaSpi.canCreateApiKey(projectId));

        if (request.getEnvironmentId() != null) {
            var env = environmentRepository.findByIdAndProjectId(request.getEnvironmentId(), projectId);
            if (env == null) {
                throw new BadRequestException("Environment does not belong to project");
            }
        }

        ApiKey k = new ApiKey();
        k.setProjectId(projectId);
        k.setName(request.getName());
        k.setEnvironmentId(request.getEnvironmentId());
        k.setDescription(request.getDescription());
        k.setApiKey(generateRawToken());
        k.setKeyType(request.getKeyType() != null ? request.getKeyType() : "SERVER");
        ApiKey saved = apiKeyRepository.save(k);
        events.publish(DomainEvent.of(saved.getProjectId(), "apikey.created", "apikey",
            saved.getId(), saved.getName(), "API key created"));
        return saved;
    }

    @Transactional
    public ApiKey update(Integer id, ApiKeyRequest request, Integer projectId) {
        ApiKey k = apiKeyRepository.findByIdAndProjectId(id, projectId);
        if (k == null) throw new NotFoundException("ApiKey", id);
        k.setName(request.getName());
        k.setEnvironmentId(request.getEnvironmentId());
        k.setDescription(request.getDescription());
        ApiKey saved = apiKeyRepository.save(k);
        events.publish(DomainEvent.of(saved.getProjectId(), "apikey.updated", "apikey",
            saved.getId(), saved.getName(), "API key updated"));
        return saved;
    }

    /**
     * Deletes an API key.
     *
     * @param id the API key ID
     */
    @Transactional
    public void delete(Integer id, Integer projectId) {
        int deleted = apiKeyRepository.deleteById(id, projectId);
        if (deleted == 0) throw new NotFoundException("ApiKey", id);
        events.publish(DomainEvent.of(projectId, "apikey.deleted", "apikey",
            id, null, "API key deleted"));
    }

    /**
     * Updates the last-used timestamp of the API key to now.
     *
     * @param id the API key ID
     */
    @Transactional
    public void updateLastUsed(Integer id) {
        apiKeyRepository.updateLastUsed(id);
    }
}