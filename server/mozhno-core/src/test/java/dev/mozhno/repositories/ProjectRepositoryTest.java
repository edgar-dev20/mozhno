package dev.mozhno.repositories;

import org.junit.jupiter.api.Test;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.projects.Project;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProjectRepositoryTest extends BaseIntegrationTest {

    @Test
    void save_shouldInsertNewProject() {
        Project project = new Project();
        project.setName("Test Project");
        project.setDescription("Test Description");

        Project saved = projectRepository.save(project);

        assertNotNull(saved.getId());
        assertEquals("Test Project", saved.getName());
        assertEquals("Test Description", saved.getDescription());
    }

    @Test
    void save_shouldUpdateExistingProject() {
        Project project = new Project();
        project.setName("Original Name");
        project.setDescription("Original Description");
        Project saved = projectRepository.save(project);

        saved.setName("Updated Name");
        Project updated = projectRepository.save(saved);

        assertEquals(saved.getId(), updated.getId());
        assertEquals("Updated Name", updated.getName());
    }

    @Test
    void findById_shouldReturnProject() {
        Project project = new Project();
        project.setName("Find Test");
        Project saved = projectRepository.save(project);

        Project found = projectRepository.findById(saved.getId());

        assertNotNull(found);
        assertEquals("Find Test", found.getName());
    }

    @Test
    void findById_shouldReturnNullForNonExistent() {
        Project found = projectRepository.findById(9999);
        assertNull(found);
    }

    @Test
    void findAll_shouldReturnAllProjects() {
        Project p1 = new Project();
        p1.setName("P1");
        projectRepository.save(p1);
        Project p2 = new Project();
        p2.setName("P2");
        projectRepository.save(p2);

        List<Project> projects = projectRepository.findAll();

        assertEquals(2, projects.size());
    }

    @Test
    void deleteById_shouldRemoveProject() {
        Project project = new Project();
        project.setName("Delete Test");
        Project saved = projectRepository.save(project);

        projectRepository.deleteById(saved.getId());

        assertNull(projectRepository.findById(saved.getId()));
    }

    @Test
    void existsById_shouldReturnTrue() {
        Project project = new Project();
        project.setName("Exists Test");
        Project saved = projectRepository.save(project);

        assertTrue(projectRepository.existsById(saved.getId()));
    }

    @Test
    void existsById_shouldReturnFalse() {
        assertFalse(projectRepository.existsById(9999));
    }

    @Test
    void count_shouldReturnCorrectCount() {
        Project p1 = new Project();
        p1.setName("C1");
        projectRepository.save(p1);
        Project p2 = new Project();
        p2.setName("C2");
        projectRepository.save(p2);

        assertEquals(2, projectRepository.count());
    }
}