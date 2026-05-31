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
import ru.mozhno.flags.strategy.GradualStrategy;
import ru.mozhno.flags.strategy.ServerStrategy;
import ru.mozhno.projects.Project;
import ru.mozhno.tags.Tag;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ClientFlagServiceTest extends BaseIntegrationTest {

    @Autowired
    private ClientFlagService clientFlagService;

    private Integer projectId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("Service Test Project");
        projectId = projectRepository.save(p).getId();
    }

    @Test
    void getFlagsForProject_shouldReturnFlagsWithStrategies() {
        Environment env = new Environment();
        env.setName("production");
        env.setProjectId(projectId);
        Integer envId = environmentRepository.save(env).getId();

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("My Feature");
        flag.setKey("my-feature");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        ServerStrategy s = new ServerStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId);

        assertThat(result).hasSize(1);
        ClientFlagResponse resp = result.get(0);
        assertThat(resp.getName()).isEqualTo("My Feature");
        assertThat(resp.getKey()).isEqualTo("my-feature");
        assertThat(resp.isEnabled()).isTrue();
        assertThat(resp.getType()).isEqualTo("release");
        assertThat(resp.getStrategies()).hasSize(1);
        assertThat(resp.getStrategies().get(0).getName()).isEqualTo("server");
    }

    @Test
    void getFlagsForProject_shouldReturnFlagsWithTags() {
        Tag tag = new Tag();
        tag.setName("team");
        tag.setColor("#FF0000");
        tag.setProjectId(projectId);
        Integer tagId = tagRepository.save(tag).getId();

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Tagged Feature");
        flag.setKey("tagged-feature");
        flag.setFlagType(FlagType.KILLSWITCH);
        Flag saved = flagRepository.save(flag);

        var ftv = new ru.mozhno.flags.FlagTagValue();
        ftv.setFlagId(saved.getId());
        ftv.setTagId(tagId);
        ftv.setTagValue("backend");
        flagTagValueRepository.save(ftv);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId);

        assertThat(result).hasSize(1);
        ClientFlagResponse resp = result.get(0);
        assertThat(resp.getType()).isEqualTo("killswitch");
        assertThat(resp.getTags()).hasSize(1);
        assertThat(resp.getTags().get(0).getTagName()).isEqualTo("team");
        assertThat(resp.getTags().get(0).getValue()).isEqualTo("backend");
    }

    @Test
    void getFlagsForProject_withGradualStrategy_shouldReturnStrategies() {
        Environment env = new Environment();
        env.setName("production");
        env.setProjectId(projectId);
        Integer envId = environmentRepository.save(env).getId();

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Gradual Feature");
        flag.setKey("gradual-feature");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        GradualStrategy gs = new GradualStrategy();
        gs.setFlagId(saved.getId());
        gs.setEnvironmentId(envId);
        gs.setEnabled(true);
        gs.setPercentage(50.0);
        flagStrategyRepository.save(gs);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStrategies()).hasSize(1);
        assertThat(result.get(0).getStrategies().get(0).getName()).isEqualTo("gradual");
    }

    @Test
    void getFlagsForProject_emptyProject_shouldReturnEmptyList() {
        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId);
        assertThat(result).isEmpty();
    }
}