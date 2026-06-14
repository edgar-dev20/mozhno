package dev.mozhno.client;

import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.apikeys.ApiKey;
import dev.mozhno.environments.Environment;
import dev.mozhno.projects.Project;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClientInstanceRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private ClientInstanceRepository repository;

    private Integer projectId;
    private Integer envId;
    private Integer apiKeyId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("CI Test Project");
        projectId = projectRepository.save(p).getId();

        Environment env = new Environment();
        env.setName("production");
        env.setProjectId(projectId);
        envId = environmentRepository.save(env).getId();

        ApiKey key = new ApiKey();
        key.setProjectId(projectId);
        key.setApiKey("ci-test-key-1");
        key.setName("CI Test Key");
        key.setKeyType("SERVER");
        apiKeyId = apiKeyRepository.save(key).getId();

        jdbcTemplate.execute("DELETE FROM client_instances");
    }

    @Test
    void upsert_shouldCreateAndMerge() {
        repository.upsert(projectId, envId, apiKeyId, "AppOne", "inst-a", "web", "1.0.0", "SERVER");

        List<ClientInstance> results = repository.findByProjectId(projectId);
        assertThat(results).hasSize(1);
        ClientInstance ci = results.get(0);
        assertThat(ci.getProjectId()).isEqualTo(projectId);
        assertThat(ci.getEnvironmentId()).isEqualTo(envId);
        assertThat(ci.getApiKeyId()).isEqualTo(apiKeyId);
        assertThat(ci.getAppName()).isEqualTo("AppOne");
        assertThat(ci.getInstanceId()).isEqualTo("inst-a");
        assertThat(ci.getAppType()).isEqualTo("web");
        assertThat(ci.getSdkVersion()).isEqualTo("1.0.0");
        assertThat(ci.getKeyType()).isEqualTo("SERVER");
        assertThat(ci.getFirstSeenAt()).isNotNull();
        assertThat(ci.getLastSeenAt()).isNotNull();

        repository.upsert(projectId, envId, null, "AppOne", "inst-a", "web", "2.0.0", "FRONTEND");
        List<ClientInstance> afterMerge = repository.findByProjectId(projectId);
        assertThat(afterMerge).hasSize(1);
        assertThat(afterMerge.get(0).getLastSeenAt()).isNotNull();
    }

    @Test
    void findByProjectId_shouldReturnOrderedByLastSeen() {
        repository.upsert(projectId, envId, apiKeyId, "AppOne", "inst-a", "web", "1.0.0", "SERVER");

        Environment env2 = new Environment();
        env2.setName("staging");
        env2.setProjectId(projectId);
        Integer env2Id = environmentRepository.save(env2).getId();
        repository.upsert(projectId, env2Id, apiKeyId, "AppTwo", "inst-b", "mobile", "1.0.0", "FRONTEND");

        List<ClientInstance> results = repository.findByProjectId(projectId);
        assertThat(results).hasSize(2);
        assertThat(results.get(0).getLastSeenAt()).isAfterOrEqualTo(results.get(1).getLastSeenAt());
    }

    @Test
    void findByProjectId_empty_shouldReturnEmptyList() {
        List<ClientInstance> results = repository.findByProjectId(999);
        assertThat(results).isEmpty();
    }

    @Test
    void findByProjectIdAndEnvironmentId_shouldFilter() {
        repository.upsert(projectId, envId, apiKeyId, "AppOne", "inst-a", "web", "1.0.0", "SERVER");

        Environment env2 = new Environment();
        env2.setName("staging");
        env2.setProjectId(projectId);
        Integer env2Id = environmentRepository.save(env2).getId();
        repository.upsert(projectId, env2Id, apiKeyId, "AppTwo", "inst-b", "mobile", "1.0.0", "FRONTEND");

        List<ClientInstance> results = repository.findByProjectIdAndEnvironmentId(projectId, envId);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getAppName()).isEqualTo("AppOne");

        List<ClientInstance> other = repository.findByProjectIdAndEnvironmentId(projectId, 99999);
        assertThat(other).isEmpty();
    }
}
