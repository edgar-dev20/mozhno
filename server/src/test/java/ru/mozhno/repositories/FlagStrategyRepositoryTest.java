package ru.mozhno.repositories;

import org.junit.jupiter.api.Test;
import ru.mozhno.BaseIntegrationTest;
import ru.mozhno.environments.Environment;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagType;
import ru.mozhno.flags.strategy.FlagStrategy;
import ru.mozhno.flags.strategy.ServerStrategy;
import ru.mozhno.flags.strategy.GradualStrategy;
import ru.mozhno.flags.strategy.TargetingStrategy;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FlagStrategyRepositoryTest extends BaseIntegrationTest {

    private Integer projectId;
    private Integer envId;
    private Integer flagId;

    @org.junit.jupiter.api.BeforeEach
    void setupEntities() {
        ru.mozhno.projects.Project p = new ru.mozhno.projects.Project();
        p.setName("Test Project");
        projectId = projectRepository.save(p).getId();

        Environment env = new Environment();
        env.setName("dev");
        env.setProjectId(projectId);
        envId = environmentRepository.save(env).getId();

        Flag f = new Flag();
        f.setProjectId(projectId);
        f.setName("test flag");
        f.setKey("test-flag");
        f.setFlagType(FlagType.RELEASE);
        flagId = flagRepository.save(f).getId();
    }

    @Test
    void findByFlagId_shouldReturnStrategies() {
        ServerStrategy s1 = new ServerStrategy();
        s1.setFlagId(flagId);
        s1.setEnvironmentId(envId);
        s1.setEnabled(true);
        flagStrategyRepository.save(s1);
        ServerStrategy s2 = new ServerStrategy();
        s2.setFlagId(flagId);
        s2.setEnvironmentId(envId);
        s2.setEnabled(false);
        flagStrategyRepository.save(s2);

        List<FlagStrategy> result = flagStrategyRepository.findByFlagId(flagId);
        assertEquals(2, result.size());
    }

    @Test
    void findById_shouldReturnStrategy() {
        ServerStrategy s = new ServerStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        FlagStrategy saved = flagStrategyRepository.save(s);

        FlagStrategy found = flagStrategyRepository.findById(saved.getId());
        assertNotNull(found);
        assertTrue(found.isEnabled());
    }

    @Test
    void findById_shouldReturnNullForNonExistent() {
        assertNull(flagStrategyRepository.findById(9999));
    }

    @Test
    void findByFlagIdAndEnvironmentId_shouldReturnStrategy() {
        ServerStrategy s = new ServerStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        flagStrategyRepository.save(s);

        FlagStrategy found = flagStrategyRepository.findByFlagIdAndEnvironmentId(flagId, envId);
        assertNotNull(found);
    }

    @Test
    void findByFlagIdAndEnvironmentId_shouldReturnNullWhenNotFound() {
        assertNull(flagStrategyRepository.findByFlagIdAndEnvironmentId(flagId, 9999));
    }

    @Test
    void save_shouldInsertServerStrategy() {
        ServerStrategy s = new ServerStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);

        FlagStrategy saved = flagStrategyRepository.save(s);
        assertNotNull(saved.getId());
        assertEquals("SERVER", saved.getStrategyType());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void save_shouldInsertGradualStrategy() {
        GradualStrategy s = new GradualStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setPercentage(50.0);

        FlagStrategy saved = flagStrategyRepository.save(s);
        assertNotNull(saved.getId());
        assertEquals("GRADUAL", saved.getStrategyType());
        assertEquals(50.0, saved.getPercentage());
    }

    @Test
    void save_shouldInsertTargetingStrategy() {
        TargetingStrategy s = new TargetingStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setRolloutPercentage(75.0);
        s.setContextValuesJson("[\"web\"]");

        FlagStrategy saved = flagStrategyRepository.save(s);
        assertNotNull(saved.getId());
        assertEquals("TARGETING", saved.getStrategyType());
        assertEquals(75.0, saved.getRolloutPercentage());
    }

    @Test
    void save_shouldUpdateExistingStrategy() {
        ServerStrategy s = new ServerStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(false);
        FlagStrategy saved = flagStrategyRepository.save(s);

        saved.setEnabled(true);
        flagStrategyRepository.save(saved);

        FlagStrategy updated = flagStrategyRepository.findById(saved.getId());
        assertTrue(updated.isEnabled());
    }

    @Test
    void deleteById_shouldRemoveStrategy() {
        ServerStrategy s = new ServerStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        FlagStrategy saved = flagStrategyRepository.save(s);

        flagStrategyRepository.deleteById(saved.getId());
        assertNull(flagStrategyRepository.findById(saved.getId()));
    }
}