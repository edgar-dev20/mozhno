package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.projects.Project;
import dev.mozhno.settings.ProjectSettings;
import dev.mozhno.settings.ProjectSettingsRepository;
import dev.mozhno.settings.ProjectSettingsService;
import dev.mozhno.settings.ProjectSettingsUpdateRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProjectSettingsServiceTest extends BaseIntegrationTest {

    @Autowired
    private ProjectSettingsService projectSettingsService;

    @Autowired
    private ProjectSettingsRepository projectSettingsRepository;

    private Integer projectId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("Settings Project");
        projectId = projectRepository.save(p).getId();
    }

    @Test
    void getOrCreate_shouldCreateDefaults() {
        ProjectSettings settings = projectSettingsService.getOrCreate(projectId);
        assertThat(settings).isNotNull();
        assertThat(settings.getProjectId()).isEqualTo(projectId);
        assertThat(settings.isRequireMfa()).isFalse();
        assertThat(settings.getSessionTimeoutHours()).isEqualTo(24);
    }

    @Test
    void getOrCreate_idempotent_shouldReturnSame() {
        ProjectSettings first = projectSettingsService.getOrCreate(projectId);
        ProjectSettings second = projectSettingsService.getOrCreate(projectId);
        assertThat(second.getId()).isEqualTo(first.getId());
    }

    @Test
    void update_shouldChangeSettings() {
        projectSettingsService.getOrCreate(projectId);

        ProjectSettingsUpdateRequest req = new ProjectSettingsUpdateRequest();
        req.setRequireMfa(true);
        req.setSessionTimeoutHours(48);
        req.setIpWhitelist("10.0.0.1");

        ProjectSettings updated = projectSettingsService.update(projectId, req);
        assertThat(updated.isRequireMfa()).isTrue();
        assertThat(updated.getSessionTimeoutHours()).isEqualTo(48);
        assertThat(updated.getIpWhitelist()).isEqualTo("10.0.0.1");
    }

    @Test
    void update_partial_shouldPreserveExisting() {
        ProjectSettings first = projectSettingsService.getOrCreate(projectId);
        first.setRequireMfa(true);
        first.setIpWhitelist("10.0.0.0/8");
        projectSettingsRepository.save(first);

        ProjectSettingsUpdateRequest req = new ProjectSettingsUpdateRequest();
        req.setRequireMfa(false);
        req.setSessionTimeoutHours(72);

        ProjectSettings updated = projectSettingsService.update(projectId, req);
        assertThat(updated.isRequireMfa()).isFalse();
        assertThat(updated.getSessionTimeoutHours()).isEqualTo(72);
    }

    @Test
    void getOrCreate_nullProjectId_shouldThrow() {
        assertThatThrownBy(() -> projectSettingsService.getOrCreate(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("projectId must not be null");
    }

    @Test
    void update_nullProjectId_shouldThrow() {
        ProjectSettingsUpdateRequest req = new ProjectSettingsUpdateRequest();
        req.setRequireMfa(false);
        req.setSessionTimeoutHours(24);

        assertThatThrownBy(() -> projectSettingsService.update(null, req))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("projectId must not be null");
    }
}
