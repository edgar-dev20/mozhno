package ru.mozhno.integrations;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class IntegrationService {
    private final IntegrationRepository repository;

    public IntegrationService(IntegrationRepository repository) {
        this.repository = repository;
    }

    public List<Integration> findByProjectId(Integer projectId) {
        return repository.findByProjectId(projectId);
    }

    public Integration findById(Integer id) {
        return repository.findById(id);
    }

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

    public Integration update(Integer id, IntegrationRequest request) {
        Integration integration = repository.findById(id);
        if (request.getName() != null) integration.setName(request.getName());
        integration.setEnabled(request.isEnabled());
        if (request.getConfigJson() != null) integration.setConfigJson(request.getConfigJson());
        if (request.getEventSubscriptionsJson() != null) integration.setEventSubscriptionsJson(request.getEventSubscriptionsJson());
        return repository.save(integration);
    }

    public void delete(Integer id) {
        repository.delete(id);
    }
}