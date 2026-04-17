package dev.mozhno.repositories;

import org.junit.jupiter.api.Test;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.segments.Segment;

import java.util.List;

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