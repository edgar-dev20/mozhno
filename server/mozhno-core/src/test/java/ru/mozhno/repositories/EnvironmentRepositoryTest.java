package ru.mozhno.repositories;

import org.junit.jupiter.api.Test;
import ru.mozhno.BaseIntegrationTest;
import ru.mozhno.environments.Environment;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class EnvironmentRepositoryTest extends BaseIntegrationTest {

    private Integer createProject() {
        ru.mozhno.projects.Project p = new ru.mozhno.projects.Project();
        p.setName("Test Project");
        return projectRepository.save(p).getId();
    }

    @Test
    void findByProjectId_shouldReturnEnvironments() {
        Integer projectId = createProject();
        Environment env1 = new Environment();
        env1.setName("dev");
        env1.setProjectId(projectId);
        environmentRepository.save(env1);
        Environment env2 = new Environment();
        env2.setName("prod");
        env2.setProjectId(projectId);
        environmentRepository.save(env2);

        List<Environment> result = environmentRepository.findByProjectId(projectId);
        assertEquals(2, result.size());
    }

    @Test
    void findById_shouldReturnEnvironment() {
        Integer projectId = createProject();
        Environment env = new Environment();
        env.setName("staging");
        env.setProjectId(projectId);
        Environment saved = environmentRepository.save(env);

        Environment found = environmentRepository.findById(saved.getId());
        assertNotNull(found);
        assertEquals("staging", found.getName());
    }

    @Test
    void findById_shouldReturnNullForNonExistent() {
        assertNull(environmentRepository.findById(9999));
    }

    @Test
    void save_shouldInsertNewEnvironment() {
        Integer projectId = createProject();
        Environment env = new Environment();
        env.setName("test");
        env.setProjectId(projectId);

        Environment saved = environmentRepository.save(env);
        assertNotNull(saved.getId());
        assertEquals("test", saved.getName());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void save_shouldUpdateExistingEnvironment() {
        Integer projectId = createProject();
        Environment env = new Environment();
        env.setName("old");
        env.setProjectId(projectId);
        Environment saved = environmentRepository.save(env);

        saved.setName("new");
        environmentRepository.save(saved);

        Environment found = environmentRepository.findById(saved.getId());
        assertEquals("new", found.getName());
    }

    @Test
    void deleteById_shouldRemoveEnvironment() {
        Integer projectId = createProject();
        Environment env = new Environment();
        env.setName("to-delete");
        env.setProjectId(projectId);
        Environment saved = environmentRepository.save(env);

        environmentRepository.deleteById(saved.getId());
        assertNull(environmentRepository.findById(saved.getId()));
    }
}