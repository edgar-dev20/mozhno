package dev.mozhno.integrations;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.NotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Service for managing third-party integrations (webhooks, Slack, etc.) within a project.
 */
@Service
public class IntegrationService {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private final IntegrationRepository repository;

    public IntegrationService(IntegrationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Integration> findByProjectId(Integer projectId) {
        return repository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Integration findById(Integer id, Integer projectId) {
        Integration integration;
        if (projectId != null) {
            integration = repository.findByIdAndProjectId(id, projectId);
        } else {
            integration = repository.findById(id);
        }
        if (integration == null) throw new NotFoundException("Integration", id);
        return integration;
    }

    @Transactional
    public Integration create(IntegrationRequest request) {
        validateWebhookConfig(request);
        Integration integration = new Integration();
        integration.setProjectId(request.getProjectId());
        integration.setType(request.getType());
        integration.setName(request.getName());
        integration.setEnabled(request.isEnabled());
        integration.setConfigJson(request.getConfigJson());
        integration.setEventSubscriptionsJson(request.getEventSubscriptionsJson());
        return repository.save(integration);
    }

    @Transactional
    public Integration update(Integer id, IntegrationRequest request, Integer projectId) {
        Integration integration;
        if (projectId != null) {
            integration = repository.findByIdAndProjectId(id, projectId);
        } else {
            integration = repository.findById(id);
        }
        if (integration == null) throw new NotFoundException("Integration", id);

        boolean changed = false;
        if (request.getName() != null && !request.getName().equals(integration.getName())) {
            integration.setName(request.getName());
            changed = true;
        }
        if (request.isEnabled() != integration.isEnabled()) {
            integration.setEnabled(request.isEnabled());
            changed = true;
        }
        if (request.getConfigJson() != null && !request.getConfigJson().equals(integration.getConfigJson())) {
            validateWebhookConfig(request);
            integration.setConfigJson(request.getConfigJson());
            changed = true;
        }
        if (request.getEventSubscriptionsJson() != null && !request.getEventSubscriptionsJson().equals(integration.getEventSubscriptionsJson())) {
            integration.setEventSubscriptionsJson(request.getEventSubscriptionsJson());
            changed = true;
        }
        return changed ? repository.save(integration) : integration;
    }

    @Transactional
    public void delete(Integer id, Integer projectId) {
        int deleted = repository.delete(id, projectId);
        if (deleted == 0) throw new NotFoundException("Integration", id);
    }

    private void validateWebhookConfig(IntegrationRequest request) {
        if (!"custom_webhook".equals(request.getType())) {
            return;
        }
        String configJson = request.getConfigJson();
        if (configJson == null || configJson.isBlank()) {
            return;
        }
        try {
            Map<String, Object> config = objectMapper.readValue(configJson, new TypeReference<Map<String, Object>>() {});
            String url = (String) config.get("url");
            if (url != null && !url.isBlank()) {
                if (!CustomWebhookService.isValidWebhookUrl(url)) {
                    throw new BadRequestException("Invalid webhook URL: must use HTTPS and point to a public host");
                }
            }
        } catch (java.io.IOException e) {
            throw new BadRequestException("Invalid webhook config JSON");
        }
    }
}