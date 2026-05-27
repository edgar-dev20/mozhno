package ru.mozhno.repositories;

import org.junit.jupiter.api.Test;
import ru.mozhno.BaseIntegrationTest;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagType;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FlagRepositoryTest extends BaseIntegrationTest {

    private Integer createProject() {
        ru.mozhno.projects.Project p = new ru.mozhno.projects.Project();
        p.setName("Test Project");
        return projectRepository.save(p).getId();
    }

    @Test
    void findByProjectId_shouldReturnFlags() {
        Integer projectId = createProject();
        Flag f1 = new Flag();
        f1.setProjectId(projectId);
        f1.setName("flag1");
        f1.setKey("flag-1");
        f1.setFlagType(FlagType.RELEASE);
        flagRepository.save(f1);
        Flag f2 = new Flag();
        f2.setProjectId(projectId);
        f2.setName("flag2");
        f2.setKey("flag-2");
        f2.setFlagType(FlagType.RELEASE);
        flagRepository.save(f2);

        List<Flag> result = flagRepository.findByProjectId(projectId);
        assertEquals(2, result.size());
    }

    @Test
    void findById_shouldReturnFlag() {
        Integer projectId = createProject();
        Flag f = new Flag();
        f.setProjectId(projectId);
        f.setName("find-me");
        f.setKey("find-key");
        f.setFlagType(FlagType.KILLSWITCH);
        Flag saved = flagRepository.save(f);

        Flag found = flagRepository.findById(saved.getId());
        assertNotNull(found);
        assertEquals("find-me", found.getName());
        assertEquals(FlagType.KILLSWITCH, found.getFlagType());
    }

    @Test
    void findById_shouldReturnNullForNonExistent() {
        assertNull(flagRepository.findById(9999));
    }

    @Test
    void findByProjectIdAndKey_shouldReturnFlag() {
        Integer projectId = createProject();
        Flag f = new Flag();
        f.setProjectId(projectId);
        f.setName("by-key");
        f.setKey("unique-key");
        f.setFlagType(FlagType.RELEASE);
        flagRepository.save(f);

        Flag found = flagRepository.findByProjectIdAndKey(projectId, "unique-key");
        assertNotNull(found);
        assertEquals("by-key", found.getName());
    }

    @Test
    void findByProjectIdAndKey_shouldReturnNullWhenNotFound() {
        assertNull(flagRepository.findByProjectIdAndKey(9999, "no-key"));
    }

    @Test
    void save_shouldInsertNewFlag() {
        Integer projectId = createProject();
        Flag f = new Flag();
        f.setProjectId(projectId);
        f.setName("new-flag");
        f.setKey("new-key");
        f.setDescription("desc");
        f.setFlagType(FlagType.RELEASE);

        Flag saved = flagRepository.save(f);
        assertNotNull(saved.getId());
        assertEquals("new-flag", saved.getName());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void save_shouldUpdateExistingFlag() {
        Integer projectId = createProject();
        Flag f = new Flag();
        f.setProjectId(projectId);
        f.setName("old");
        f.setKey("old-key");
        f.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(f);

        saved.setName("updated");
        saved.setFlagType(FlagType.KILLSWITCH);
        flagRepository.save(saved);

        Flag found = flagRepository.findById(saved.getId());
        assertEquals("updated", found.getName());
        assertEquals(FlagType.KILLSWITCH, found.getFlagType());
    }

    @Test
    void deleteById_shouldRemoveFlag() {
        Integer projectId = createProject();
        Flag f = new Flag();
        f.setProjectId(projectId);
        f.setName("del");
        f.setKey("del-key");
        Flag saved = flagRepository.save(f);

        flagRepository.deleteById(saved.getId());
        assertNull(flagRepository.findById(saved.getId()));
    }
}