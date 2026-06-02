package ru.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import ru.mozhno.BaseIntegrationTest;
import ru.mozhno.client.ClientFlagResponse;
import ru.mozhno.client.ClientFlagService;
import ru.mozhno.environments.Environment;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagType;
import ru.mozhno.flags.strategy.FlagStrategy;
import ru.mozhno.projects.Project;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClientFlagServiceTest extends BaseIntegrationTest {

    @Autowired
    private ClientFlagService clientFlagService;

    private Integer projectId;
    private Integer envId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("Service Test Project");
        projectId = projectRepository.save(p).getId();

        Environment env = new Environment();
        env.setName("production");
        env.setProjectId(projectId);
        envId = environmentRepository.save(env).getId();
    }

    @Test
    void getFlagsForProject_shouldReturnFlagsWithStrategies() {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("My Feature");
        flag.setKey("my-feature");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        ClientFlagResponse resp = result.get(0);
        assertThat(resp.getName()).isEqualTo("My Feature");
        assertThat(resp.getKey()).isEqualTo("my-feature");
        assertThat(resp.isEnabled()).isTrue();
        assertThat(resp.getActivation()).isNotNull();
    }

    @Test
    void getFlagsForProject_withPercentage_shouldReturnActivationWithRollOut() {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Gradual Feature");
        flag.setKey("gradual-feature");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setPercentage(50.0);
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getActivation()).isNotNull();
        assertThat(result.get(0).getActivation().getRollOut()).isEqualTo(50.0);
    }

    @Test
    void getFlagsForProject_emptyProject_shouldReturnEmptyList() {
        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);
        assertThat(result).isEmpty();
    }

    @Test
    void getFlagsForProject_wrongEnvironment_shouldReturnEmptyList() {
        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, 9999);
        assertThat(result).isEmpty();
    }
}