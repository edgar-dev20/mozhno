package ru.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.mozhno.projects.Project;
import ru.mozhno.projects.ProjectRepository;
import ru.mozhno.projects.ProjectRequest;
import ru.mozhno.projects.ProjectService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectService(projectRepository);
    }

    @Test
    void findAll_shouldReturnAllProjects() {
        Project p1 = new Project();
        p1.setId(1);
        p1.setName("Project 1");
        Project p2 = new Project();
        p2.setId(2);
        p2.setName("Project 2");
        when(projectRepository.findAll()).thenReturn(List.of(p1, p2));

        List<Project> result = projectService.findAll();
        assertEquals(2, result.size());
        verify(projectRepository).findAll();
    }

    @Test
    void findById_shouldReturnProject() {
        Project p = new Project();
        p.setId(1);
        p.setName("Test");
        when(projectRepository.findById(1)).thenReturn(p);

        Project result = projectService.findById(1);
        assertNotNull(result);
        assertEquals("Test", result.getName());
    }

    @Test
    void findById_shouldThrowExceptionWhenNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> projectService.findById(999));
        assertTrue(ex.getMessage().contains("Project not found"));
    }

    @Test
    void create_shouldSaveAndReturnProject() {
        ProjectRequest request = new ProjectRequest();
        request.setName("New Project");
        request.setDescription("Description");

        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> {
            Project p = inv.getArgument(0);
            p.setId(1);
            return p;
        });

        Project result = projectService.create(request);
        assertNotNull(result);
        assertEquals("New Project", result.getName());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void update_shouldUpdateAndReturnProject() {
        Project existing = new Project();
        existing.setId(1);
        existing.setName("Old");
        when(projectRepository.findById(1)).thenReturn(existing);
        when(projectRepository.save(any(Project.class))).thenReturn(existing);

        ProjectRequest request = new ProjectRequest();
        request.setName("New Name");

        Project result = projectService.update(1, request);
        assertEquals("New Name", result.getName());
        verify(projectRepository).findById(1);
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void update_shouldThrowExceptionWhenNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);

        ProjectRequest request = new ProjectRequest();
        request.setName("New");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> projectService.update(999, request));
        assertTrue(ex.getMessage().contains("Project not found"));
    }

    @Test
    void delete_shouldCallRepository() {
        doNothing().when(projectRepository).deleteById(1);
        projectService.delete(1);
        verify(projectRepository).deleteById(1);
    }
}