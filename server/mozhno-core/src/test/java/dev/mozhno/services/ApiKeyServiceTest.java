package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.apikeys.ApiKey;
import dev.mozhno.apikeys.ApiKeyRequest;
import dev.mozhno.apikeys.ApiKeyService;
import dev.mozhno.projects.Project;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ApiKeyServiceTest extends BaseIntegrationTest {

    @Autowired
    private ApiKeyService apiKeyService;

    private Integer projectId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("Test Project");
        projectId = projectRepository.save(p).getId();
    }

    @Test
    void create_shouldGenerateApiKey() {
        ApiKeyRequest request = new ApiKeyRequest("My Service", null, "Test description", null);
        ApiKey result = apiKeyService.create(projectId, request);

        assertThat(result.getId()).isNotNull();
        assertThat(result.getName()).isEqualTo("My Service");
        assertThat(result.getApiKey()).isNotEmpty();
        assertThat(result.getApiKey().length()).isGreaterThan(20);
    }

    @Test
    void findByProjectId_shouldReturnCreatedKeys() {
        apiKeyService.create(projectId, new ApiKeyRequest("Svc A", null, null, null));
        apiKeyService.create(projectId, new ApiKeyRequest("Svc B", null, null, null));

        List<ApiKey> keys = apiKeyService.findByProjectId(projectId);
        assertThat(keys).hasSize(2);
    }

    @Test
    void findByApiKey_shouldFindByToken() {
        ApiKey created = apiKeyService.create(projectId, new ApiKeyRequest("Svc", null, null, null));

        ApiKey found = apiKeyService.findByApiKey(created.getApiKey());
        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(created.getId());
    }

    @Test
    void delete_shouldRemoveKey() {
        ApiKey created = apiKeyService.create(projectId, new ApiKeyRequest("To Delete", null, null, null));
        apiKeyService.delete(created.getId(), projectId);

        assertThatThrownBy(() -> apiKeyService.findById(created.getId()))
                .hasMessageContaining("ApiKey not found");
    }
}