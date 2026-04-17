package dev.mozhno.settings;

import org.springframework.stereotype.Component;

@Component
public class SettingsAssembler {

    public ProjectSettingsResponse toResponse(ProjectSettings settings) {
        return ProjectSettingsResponse.builder()
            .id(settings.getId())
            .projectId(settings.getProjectId())
            .requireMfa(settings.isRequireMfa())
            .sessionTimeoutHours(settings.getSessionTimeoutHours())
            .ipWhitelist(settings.getIpWhitelist())
            .accentColor(settings.getAccentColor())
            .createdAt(settings.getCreatedAt())
            .updatedAt(settings.getUpdatedAt())
            .build();
    }
}
