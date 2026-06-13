package dev.mozhno.repositories;

import org.junit.jupiter.api.Test;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.environments.Environment;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagType;
import dev.mozhno.flags.strategy.FlagStrategy;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FlagStrategyRepositoryTest extends BaseIntegrationTest {

    private Integer projectId;
    private Integer envId;
    private Integer flagId;

    @org.junit.jupiter.api.BeforeEach
    void setupEntities() {
        dev.mozhno.projects.Project p = new dev.mozhno.projects.Project();
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
        FlagStrategy s1 = new FlagStrategy();
        s1.setFlagId(flagId);
        s1.setEnvironmentId(envId);
        s1.setEnabled(true);
        flagStrategyRepository.save(s1);

        Environment env2 = new Environment();
        env2.setName("staging");
        env2.setProjectId(projectId);
        int envId2 = environmentRepository.save(env2).getId();

        FlagStrategy s2 = new FlagStrategy();
        s2.setFlagId(flagId);
        s2.setEnvironmentId(envId2);
        s2.setEnabled(false);
        flagStrategyRepository.save(s2);

        List<FlagStrategy> result = flagStrategyRepository.findByFlagId(flagId);
        assertEquals(2, result.size());
    }

    @Test
    void findById_shouldReturnStrategy() {
        FlagStrategy s = new FlagStrategy();
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
        FlagStrategy s = new FlagStrategy();
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
    void save_shouldInsertStrategy() {
        FlagStrategy s = new FlagStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);

        FlagStrategy saved = flagStrategyRepository.save(s);
        assertNotNull(saved.getId());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void save_shouldInsertStrategyWithPercentage() {
        FlagStrategy s = new FlagStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setPercentage(50.0);

        FlagStrategy saved = flagStrategyRepository.save(s);
        assertNotNull(saved.getId());
        assertEquals(50.0, saved.getPercentage());
    }

    @Test
    void save_shouldInsertStrategyWithContextValues() {
        FlagStrategy s = new FlagStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setPercentage(75.0);
        s.setContextValuesJson("[\"web\"]");

        FlagStrategy saved = flagStrategyRepository.save(s);
        assertNotNull(saved.getId());
        assertEquals(75.0, saved.getPercentage());
        assertEquals("[\"web\"]", saved.getContextValuesJson());
    }

    @Test
    void save_shouldUpdateExistingStrategy() {
        FlagStrategy s = new FlagStrategy();
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
        FlagStrategy s = new FlagStrategy();
        s.setFlagId(flagId);
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        FlagStrategy saved = flagStrategyRepository.save(s);

        flagStrategyRepository.deleteById(saved.getId());
        assertNull(flagStrategyRepository.findById(saved.getId()));
    }
}