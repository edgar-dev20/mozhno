package dev.mozhno.repositories;

import org.junit.jupiter.api.Test;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagTagValue;
import dev.mozhno.flags.FlagType;
import dev.mozhno.tags.Tag;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FlagTagValueRepositoryTest extends BaseIntegrationTest {

    private Integer projectId;
    private Integer tagId;
    private Integer flagId;

    @org.junit.jupiter.api.BeforeEach
    void setupEntities() {
        dev.mozhno.projects.Project p = new dev.mozhno.projects.Project();
        p.setName("Test Project");
        projectId = projectRepository.save(p).getId();

        Tag t = new Tag();
        t.setName("release");
        t.setColor("#FF0000");
        t.setProjectId(projectId);
        tagId = tagRepository.save(t).getId();

        Flag f = new Flag();
        f.setProjectId(projectId);
        f.setName("test flag");
        f.setKey("test-flag");
        f.setFlagType(FlagType.RELEASE);
        flagId = flagRepository.save(f).getId();
    }

    @Test
    void findByFlagId_shouldReturnTagValues() {
        FlagTagValue ftv = new FlagTagValue();
        ftv.setFlagId(flagId);
        ftv.setTagId(tagId);
        ftv.setTagValue("v1.0");
        flagTagValueRepository.save(ftv);

        List<FlagTagValue> result = flagTagValueRepository.findByFlagId(flagId);
        assertEquals(1, result.size());
        assertEquals("v1.0", result.get(0).getTagValue());
    }

    @Test
    void findByFlagId_shouldReturnEmptyListWhenNone() {
        List<FlagTagValue> result = flagTagValueRepository.findByFlagId(flagId);
        assertTrue(result.isEmpty());
    }

    @Test
    void save_shouldInsertTagValue() {
        FlagTagValue ftv = new FlagTagValue();
        ftv.setFlagId(flagId);
        ftv.setTagId(tagId);
        ftv.setTagValue("v2.0");
        flagTagValueRepository.save(ftv);

        List<FlagTagValue> result = flagTagValueRepository.findByFlagId(flagId);
        assertEquals(1, result.size());
    }

    @Test
    void deleteByFlagId_shouldRemoveAllTagValuesForFlag() {
        FlagTagValue ftv = new FlagTagValue();
        ftv.setFlagId(flagId);
        ftv.setTagId(tagId);
        ftv.setTagValue("test");
        flagTagValueRepository.save(ftv);

        flagTagValueRepository.deleteByFlagId(flagId);

        List<FlagTagValue> result = flagTagValueRepository.findByFlagId(flagId);
        assertTrue(result.isEmpty());
    }
}