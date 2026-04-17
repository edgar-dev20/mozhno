package dev.mozhno.repositories;

import org.junit.jupiter.api.Test;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.contexts.ContextDefinition;
import dev.mozhno.segments.Segment;
import dev.mozhno.segments.SegmentContext;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SegmentContextRepositoryTest extends BaseIntegrationTest {

    private static class Fixture {
        Integer projectId;
        Integer segmentId;
        Integer contextDefId1;
        Integer contextDefId2;
    }

    private Fixture createFixture() {
        Fixture f = new Fixture();
        dev.mozhno.projects.Project p = new dev.mozhno.projects.Project();
        p.setName("Test Project");
        f.projectId = projectRepository.save(p).getId();

        ContextDefinition cd1 = new ContextDefinition();
        cd1.setName("appName");
        cd1.setProjectId(f.projectId);
        f.contextDefId1 = contextDefinitionRepository.save(cd1).getId();

        ContextDefinition cd2 = new ContextDefinition();
        cd2.setName("userId");
        cd2.setProjectId(f.projectId);
        f.contextDefId2 = contextDefinitionRepository.save(cd2).getId();

        Segment s = new Segment();
        s.setName("Test Segment");
        s.setProjectId(f.projectId);
        f.segmentId = segmentRepository.save(s).getId();

        return f;
    }

    @Test
    void findBySegmentId_shouldReturnContexts() {
        Fixture f = createFixture();

        SegmentContext sc1 = new SegmentContext();
        sc1.setSegmentId(f.segmentId);
        sc1.setContextDefinitionId(f.contextDefId1);
        sc1.setContextValues("[\"web\"]");
        segmentContextRepository.save(sc1);

        SegmentContext sc2 = new SegmentContext();
        sc2.setSegmentId(f.segmentId);
        sc2.setContextDefinitionId(f.contextDefId2);
        sc2.setContextValues("[\"mobile\"]");
        segmentContextRepository.save(sc2);

        List<SegmentContext> result = segmentContextRepository.findBySegmentId(f.segmentId);
        assertEquals(2, result.size());
    }

    @Test
    void save_shouldInsertNewContext() {
        Fixture f = createFixture();
        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(f.segmentId);
        sc.setContextDefinitionId(f.contextDefId1);
        sc.setContextValues("[\"web\",\"mobile\"]");

        SegmentContext saved = segmentContextRepository.save(sc);
        assertNotNull(saved.getId());
        assertEquals("[\"web\",\"mobile\"]", saved.getContextValues());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void deleteBySegmentId_shouldRemoveAllContexts() {
        Fixture f = createFixture();

        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(f.segmentId);
        sc.setContextDefinitionId(f.contextDefId1);
        sc.setContextValues("[\"web\"]");
        segmentContextRepository.save(sc);

        assertEquals(1, segmentContextRepository.findBySegmentId(f.segmentId).size());

        segmentContextRepository.deleteBySegmentId(f.segmentId);
        assertTrue(segmentContextRepository.findBySegmentId(f.segmentId).isEmpty());
    }

    @Test
    void contextShouldBeCascadedOnSegmentDelete() {
        Fixture f = createFixture();

        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(f.segmentId);
        sc.setContextDefinitionId(f.contextDefId1);
        sc.setContextValues("[\"web\"]");
        segmentContextRepository.save(sc);

        assertEquals(1, segmentContextRepository.findBySegmentId(f.segmentId).size());

        segmentRepository.deleteById(f.segmentId, f.projectId);
        assertTrue(segmentContextRepository.findBySegmentId(f.segmentId).isEmpty());
    }
}