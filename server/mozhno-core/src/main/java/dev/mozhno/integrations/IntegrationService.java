package dev.mozhno.integrations;

import dev.mozhno.exception.NotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing third-party integrations (webhooks, Slack, etc.) within a project.
 */
@Service
public class IntegrationService {
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
}