package dev.mozhno.repositories;

import org.junit.jupiter.api.Test;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.environments.Environment;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagType;
import dev.mozhno.flags.strategy.FlagStrategy;
import dev.mozhno.segments.Segment;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SegmentRepositoryTest extends BaseIntegrationTest {

    private Integer createProject() {
        dev.mozhno.projects.Project p = new dev.mozhno.projects.Project();
        p.setName("Test Project");
        return projectRepository.save(p).getId();
    }

    @Test
    void findByProjectId_shouldReturnSegments() {
        Integer projectId = createProject();
        Segment s1 = new Segment();
        s1.setName("Power Users");
        s1.setProjectId(projectId);
        segmentRepository.save(s1);
        Segment s2 = new Segment();
        s2.setName("Beta Users");
        s2.setProjectId(projectId);
        segmentRepository.save(s2);

        List<Segment> result = segmentRepository.findByProjectId(projectId);
        assertEquals(2, result.size());
    }

    @Test
    void findById_shouldReturnSegment() {
        Integer projectId = createProject();
        Segment s = new Segment();
        s.setName("Power Users");
        s.setDescription("High-value users");
        s.setProjectId(projectId);
        Segment saved = segmentRepository.save(s);

        Segment found = segmentRepository.findById(saved.getId());
        assertNotNull(found);
        assertEquals("Power Users", found.getName());
        assertEquals("High-value users", found.getDescription());
    }

    @Test
    void findById_shouldReturnNullForNonExistent() {
        assertNull(segmentRepository.findById(9999));
    }

    @Test
    void save_shouldInsertNewSegment() {
        Integer projectId = createProject();
        Segment s = new Segment();
        s.setName("New Segment");
        s.setDescription("Test");
        s.setProjectId(projectId);

        Segment saved = segmentRepository.save(s);
        assertNotNull(saved.getId());
        assertEquals("New Segment", saved.getName());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void save_shouldUpdateExistingSegment() {
        Integer projectId = createProject();
        Segment s = new Segment();
        s.setName("Old");
        s.setProjectId(projectId);
        Segment saved = segmentRepository.save(s);

        saved.setName("Updated");
        saved.setDescription("Updated desc");
        segmentRepository.save(saved);

        Segment found = segmentRepository.findById(saved.getId());
        assertEquals("Updated", found.getName());
        assertEquals("Updated desc", found.getDescription());
    }

    @Test
    void deleteById_shouldRemoveSegment() {
        Integer projectId = createProject();
        Segment s = new Segment();
        s.setName("To Delete");
        s.setProjectId(projectId);
        Segment saved = segmentRepository.save(s);

        segmentRepository.deleteById(saved.getId(), saved.getProjectId());
        assertNull(segmentRepository.findById(saved.getId()));
    }

    @Test
    void countFlagsBySegmentIds_shouldCountDistinctFlagsPerSegment() {
        Integer projectId = createProject();

        Environment env1 = new Environment();
        env1.setName("dev");
        env1.setProjectId(projectId);
        Integer env1Id = environmentRepository.save(env1).getId();

        Environment env2 = new Environment();
        env2.setName("prod");
        env2.setProjectId(projectId);
        Integer env2Id = environmentRepository.save(env2).getId();

        Flag f1 = new Flag();
        f1.setProjectId(projectId);
        f1.setName("flag one");
        f1.setKey("flag-one");
        f1.setFlagType(FlagType.RELEASE);
        Integer f1Id = flagRepository.save(f1).getId();

        Flag f2 = new Flag();
        f2.setProjectId(projectId);
        f2.setName("flag two");
        f2.setKey("flag-two");
        f2.setFlagType(FlagType.RELEASE);
        Integer f2Id = flagRepository.save(f2).getId();

        Segment segment = new Segment();
        segment.setName("Shared Segment");
        segment.setProjectId(projectId);
        Integer segmentId = segmentRepository.save(segment).getId();

        Segment unused = new Segment();
        unused.setName("Unused Segment");
        unused.setProjectId(projectId);
        Integer unusedId = segmentRepository.save(unused).getId();

        FlagStrategy s1 = new FlagStrategy();
        s1.setFlagId(f1Id);
        s1.setEnvironmentId(env1Id);
        s1.setEnabled(true);
        s1.setSegmentIds(List.of(segmentId));
        flagStrategyRepository.save(s1);

        FlagStrategy s2 = new FlagStrategy();
        s2.setFlagId(f1Id);
        s2.setEnvironmentId(env2Id);
        s2.setEnabled(true);
        s2.setSegmentIds(List.of(segmentId));
        flagStrategyRepository.save(s2);

        FlagStrategy s3 = new FlagStrategy();
        s3.setFlagId(f2Id);
        s3.setEnvironmentId(env1Id);
        s3.setEnabled(true);
        s3.setSegmentIds(List.of(segmentId));
        flagStrategyRepository.save(s3);

        Map<Integer, Integer> counts = segmentRepository.countFlagsBySegmentIds(List.of(segmentId, unusedId));
        assertEquals(2, counts.get(segmentId).intValue());
        assertFalse(counts.containsKey(unusedId));
    }

    @Test
    void countFlagsBySegmentIds_shouldReturnEmptyForEmptyOrUnknownIds() {
        assertTrue(segmentRepository.countFlagsBySegmentIds(List.of()).isEmpty());
        assertTrue(segmentRepository.countFlagsBySegmentIds(List.of(9999)).isEmpty());
    }

    @Test
    void segments_shouldBeCascadedOnProjectDelete() {
        Integer projectId = createProject();
        Segment s = new Segment();
        s.setName("Cascade test");
        s.setProjectId(projectId);
        segmentRepository.save(s);

        assertEquals(1, segmentRepository.findByProjectId(projectId).size());

        projectRepository.deleteById(projectId);
        assertTrue(segmentRepository.findByProjectId(projectId).isEmpty());
    }
}