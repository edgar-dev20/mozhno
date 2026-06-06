package ru.mozhno.repositories;

import org.junit.jupiter.api.Test;
import ru.mozhno.BaseIntegrationTest;
import ru.mozhno.contexts.ContextDefinition;
import ru.mozhno.contexts.ContextValue;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ContextValueRepositoryTest extends BaseIntegrationTest {

    private Integer createProjectAndDef() {
        ru.mozhno.projects.Project p = new ru.mozhno.projects.Project();
        p.setName("Test Project");
        Integer projectId = projectRepository.save(p).getId();
        ContextDefinition cd = new ContextDefinition();
        cd.setName("userId");
        cd.setProjectId(projectId);
        return contextDefinitionRepository.save(cd).getId();
    }

    @Test
    void findByContextDefinitionId_shouldReturnValues() {
        Integer defId = createProjectAndDef();
        ContextValue cv1 = new ContextValue();
        cv1.setContextDefinitionId(defId);
        cv1.setValues("[\"user1\"]");
        contextValueRepository.save(cv1);
        ContextValue cv2 = new ContextValue();
        cv2.setContextDefinitionId(defId);
        cv2.setValues("[\"user2\"]");
        contextValueRepository.save(cv2);

        List<ContextValue> result = contextValueRepository.findByContextDefinitionId(defId);
        assertEquals(2, result.size());
    }

    @Test
    void findById_shouldReturnValue() {
        Integer defId = createProjectAndDef();
        ContextValue cv = new ContextValue();
        cv.setContextDefinitionId(defId);
        cv.setValues("[\"test\"]");
        ContextValue saved = contextValueRepository.save(cv);

        ContextValue found = contextValueRepository.findById(saved.getId());
        assertNotNull(found);
        assertEquals("[\"test\"]", found.getValues());
    }

    @Test
    void findById_shouldReturnNullForNonExistent() {
        assertNull(contextValueRepository.findById(9999));
    }

    @Test
    void save_shouldInsertNewContextValue() {
        Integer defId = createProjectAndDef();
        ContextValue cv = new ContextValue();
        cv.setContextDefinitionId(defId);
        cv.setValues("[\"new-user\"]");

        ContextValue saved = contextValueRepository.save(cv);
        assertNotNull(saved.getId());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void deleteById_shouldRemoveContextValue() {
        Integer defId = createProjectAndDef();
        ContextValue cv = new ContextValue();
        cv.setContextDefinitionId(defId);
        cv.setValues("[\"del\"]");
        ContextValue saved = contextValueRepository.save(cv);

        contextValueRepository.deleteById(saved.getId());
        assertNull(contextValueRepository.findById(saved.getId()));
    }
}