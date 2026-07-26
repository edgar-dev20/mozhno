package dev.mozhno.settings;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing project-level security settings such as MFA requirement,
 * session timeout, and IP whitelisting.
 */
@Service
@Transactional
public class ProjectSettingsService {
    private final ProjectSettingsRepository repository;

    public ProjectSettingsService(ProjectSettingsRepository repository) {
        this.repository = repository;
    }

    /**
     * Retrieves project settings, creating defaults if none exist.
     *
     * @param projectId the project ID
     * @return the project settings
     */
    public ProjectSettings getOrCreate(Integer projectId) {
        if (projectId == null) {
            throw new IllegalArgumentException("projectId must not be null");
        }
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

    /**
     * Updates project security settings.
     *
     * @param projectId the project ID
     * @param request the settings update request
     * @return the updated project settings
     */
    public ProjectSettings update(Integer projectId, ProjectSettingsUpdateRequest request) {
        if (projectId == null) {
            throw new IllegalArgumentException("projectId must not be null");
        }
        ProjectSettings settings = getOrCreate(projectId);
        settings.setRequireMfa(request.isRequireMfa());
        settings.setSessionTimeoutHours(request.getSessionTimeoutHours());
        if (request.getIpWhitelist() != null) settings.setIpWhitelist(request.getIpWhitelist());
        if (request.getAccentColor() != null) settings.setAccentColor(request.getAccentColor());
        return repository.save(settings);
    }
}