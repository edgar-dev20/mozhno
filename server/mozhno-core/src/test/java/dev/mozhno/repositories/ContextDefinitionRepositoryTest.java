package dev.mozhno.repositories;

import org.junit.jupiter.api.Test;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.contexts.ContextDefinition;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ContextDefinitionRepositoryTest extends BaseIntegrationTest {

    private Integer createProject() {
        dev.mozhno.projects.Project p = new dev.mozhno.projects.Project();
        p.setName("Test Project");
        return projectRepository.save(p).getId();
    }

    @Test
    void findByProjectId_shouldReturnDefinitions() {
        Integer projectId = createProject();
        ContextDefinition cd1 = new ContextDefinition();
        cd1.setName("userId");
        cd1.setProjectId(projectId);
        contextDefinitionRepository.save(cd1);
        ContextDefinition cd2 = new ContextDefinition();
        cd2.setName("appName");
        cd2.setProjectId(projectId);
        contextDefinitionRepository.save(cd2);

        List<ContextDefinition> result = contextDefinitionRepository.findByProjectId(projectId);
        assertEquals(2, result.size());
    }

    @Test
    void findById_shouldReturnDefinition() {
        Integer projectId = createProject();
        ContextDefinition cd = new ContextDefinition();
        cd.setName("os");
        cd.setProjectId(projectId);
        ContextDefinition saved = contextDefinitionRepository.save(cd);

        ContextDefinition found = contextDefinitionRepository.findById(saved.getId());
        assertNotNull(found);
        assertEquals("os", found.getName());
    }

    @Test
    void findById_shouldReturnNullForNonExistent() {
        assertNull(contextDefinitionRepository.findById(9999));
    }

    @Test
    void save_shouldInsertNewContextDefinition() {
        Integer projectId = createProject();
        ContextDefinition cd = new ContextDefinition();
        cd.setName("country");
        cd.setDescription("User country");
        cd.setProjectId(projectId);

        ContextDefinition saved = contextDefinitionRepository.save(cd);
        assertNotNull(saved.getId());
        assertEquals("country", saved.getName());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void save_shouldUpdateExistingContextDefinition() {
        Integer projectId = createProject();
        ContextDefinition cd = new ContextDefinition();
        cd.setName("old");
        cd.setProjectId(projectId);
        ContextDefinition saved = contextDefinitionRepository.save(cd);

        saved.setName("new");
        saved.setDescription("Updated description");
        contextDefinitionRepository.save(saved);

        ContextDefinition found = contextDefinitionRepository.findById(saved.getId());
        assertEquals("new", found.getName());
        assertEquals("Updated description", found.getDescription());
    }

    @Test
    void deleteById_shouldRemoveContextDefinition() {
        Integer projectId = createProject();
        ContextDefinition cd = new ContextDefinition();
        cd.setName("del");
        cd.setProjectId(projectId);
        ContextDefinition saved = contextDefinitionRepository.save(cd);

        contextDefinitionRepository.deleteById(saved.getId(), saved.getProjectId());
        assertNull(contextDefinitionRepository.findById(saved.getId()));
    }
}