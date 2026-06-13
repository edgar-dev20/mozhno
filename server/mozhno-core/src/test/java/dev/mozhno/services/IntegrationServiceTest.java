package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.integrations.Integration;
import dev.mozhno.integrations.IntegrationRequest;
import dev.mozhno.integrations.IntegrationService;
import dev.mozhno.projects.Project;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class IntegrationServiceTest extends BaseIntegrationTest {

    @Autowired
    private IntegrationService integrationService;

    private Integer projectId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("Integration Project");
        projectId = projectRepository.save(p).getId();
    }

    @Test
    void findByProjectId_empty_shouldReturnEmpty() {
        List<Integration> result = integrationService.findByProjectId(projectId);
        assertThat(result).isEmpty();
    }

    @Test
    void create_shouldCreateIntegration() {
        IntegrationRequest req = new IntegrationRequest();
        req.setProjectId(projectId);
        req.setType("custom_webhook");
        req.setName("My Webhook");
        req.setEnabled(true);
        req.setConfigJson("{\"url\":\"https://example.com\"}");
        req.setEventSubscriptionsJson("[\"flag.created\"]");

        Integration created = integrationService.create(req);
        assertThat(created.getId()).isNotNull();
        assertThat(created.getName()).isEqualTo("My Webhook");
        assertThat(created.isEnabled()).isTrue();
    }

    @Test
    void findByProjectId_afterCreate_shouldReturnIntegration() {
        IntegrationRequest req = new IntegrationRequest();
        req.setProjectId(projectId);
        req.setType("custom_webhook");
        req.setName("Webhook Bot");
        req.setEnabled(false);
        req.setConfigJson("{}");
        req.setEventSubscriptionsJson("[]");
        integrationService.create(req);

        List<Integration> result = integrationService.findByProjectId(projectId);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Webhook Bot");
    }

    @Test
    void update_partial_shouldPreserveExisting() {
        IntegrationRequest req = new IntegrationRequest();
        req.setProjectId(projectId);
        req.setType("custom_webhook");
        req.setName("Original");
        req.setEnabled(true);
        req.setConfigJson("{\"key\":\"old\"}");
        req.setEventSubscriptionsJson("[]");
        Integration created = integrationService.create(req);

        IntegrationRequest update = new IntegrationRequest();
        update.setConfigJson("{\"key\":\"old\"}"); // preserve via request
        update.setEventSubscriptionsJson("[]");
        update.setName("Modified");
        update.setEnabled(true);
        Integration updated = integrationService.update(created.getId(), update);

        assertThat(updated.getName()).isEqualTo("Modified");
        assertThat(updated.getConfigJson()).isEqualTo("{\"key\":\"old\"}");
    }

    @Test
    void delete_shouldRemoveIntegration() {
        IntegrationRequest req = new IntegrationRequest();
        req.setProjectId(projectId);
        req.setType("custom_webhook");
        req.setName("To Delete");
        req.setEnabled(true);
        req.setConfigJson("{}");
        req.setEventSubscriptionsJson("[]");
        Integration created = integrationService.create(req);

        integrationService.delete(created.getId(), projectId);

        List<Integration> result = integrationService.findByProjectId(projectId);
        assertThat(result).isEmpty();
    }

    @Test
    void findById_shouldReturnIntegration() {
        IntegrationRequest req = new IntegrationRequest();
        req.setProjectId(projectId);
        req.setType("custom_webhook");
        req.setName("Test");
        req.setEnabled(true);
        req.setConfigJson("{}");
        req.setEventSubscriptionsJson("[]");
        Integration created = integrationService.create(req);

        Integration found = integrationService.findById(created.getId());
        assertThat(found.getName()).isEqualTo("Test");
    }
}
