package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.audit.AuditEvent;
import dev.mozhno.audit.AuditService;
import dev.mozhno.projects.Project;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AuditServiceTest extends BaseIntegrationTest {

    @Autowired
    private AuditService auditService;

    private Integer projectId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("Audit Project");
        projectId = projectRepository.save(p).getId();
    }

    @Test
    void findByProjectId_empty_shouldReturnEmpty() {
        List<AuditEvent> result = auditService.findByProjectId(projectId);
        assertThat(result).isEmpty();
    }

    @Test
    void log_shouldCreateAuditEvent() {
        AuditEvent event = auditService.log(projectId, null, "Test User", "test@example.com",
            "flag.created", "flag", 42, "My Flag", "created by admin", "127.0.0.1");

        assertThat(event.getId()).isNotNull();
        assertThat(event.getProjectId()).isEqualTo(projectId);
        assertThat(event.getAction()).isEqualTo("flag.created");
        assertThat(event.getResourceType()).isEqualTo("flag");
        assertThat(event.getResourceName()).isEqualTo("My Flag");
    }

    @Test
    void findByProjectId_afterLog_shouldReturnEvents() {
        auditService.log(projectId, null, "User", "user@example.com",
            "flag.created", "flag", 1, "f1", "details", "1.2.3.4");
        auditService.log(projectId, null, "Admin", "admin@example.com",
            "flag.updated", "flag", 2, "f2", "more", "5.6.7.8");

        List<AuditEvent> result = auditService.findByProjectId(projectId);
        assertThat(result).hasSize(2);
    }

    @Test
    void log_withNullFields_shouldWork() {
        AuditEvent event = auditService.log(null, null, "system", "system",
            "system.startup", "system", null, null, null, null);

        assertThat(event.getId()).isNotNull();
        assertThat(event.getProjectId()).isNull();
    }
}
