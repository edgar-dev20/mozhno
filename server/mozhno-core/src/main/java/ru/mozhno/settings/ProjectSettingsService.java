package ru.mozhno.settings;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectSettingsService {
    private final ProjectSettingsRepository repository;

    public ProjectSettingsService(ProjectSettingsRepository repository) {
        this.repository = repository;
    }

    public ProjectSettings getOrCreate(Integer projectId) {
        ProjectSettings settings = repository.findByProjectId(projectId);
        if (settings == null) {
            settings = new ProjectSettings();
            settings.setProjectId(projectId);
            settings.setRequireMfa(false);
            settings.setSessionTimeoutHours(24);
            return repository.save(settings);
        }
        return settings;
    }

    public ProjectSettings update(Integer projectId, ProjectSettingsUpdateRequest request) {
        ProjectSettings settings = getOrCreate(projectId);
        settings.setRequireMfa(request.isRequireMfa());
        settings.setSessionTimeoutHours(request.getSessionTimeoutHours());
        if (request.getIpWhitelist() != null) settings.setIpWhitelist(request.getIpWhitelist());
        return repository.save(settings);
    }
}