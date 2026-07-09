package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import dev.mozhno.contexts.ContextDefinitionRequest;
import dev.mozhno.contexts.ContextService;
import dev.mozhno.environments.EnvironmentService;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.projects.Project;
import dev.mozhno.projects.ProjectRepository;
import dev.mozhno.projects.ProjectRequest;
import dev.mozhno.projects.ProjectService;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private DomainEventPublisher events;

    @Mock
    private EnvironmentService environmentService;

    @Mock
    private ContextService contextService;

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectService(projectRepository, events, environmentService, contextService);
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
        verify(environmentService).create(1, "Production", null, null, false);
        verify(environmentService).create(1, "Development", null, null, false);
        verify(contextService).createDefinition(any(ContextDefinitionRequest.class), isNull());
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
        Project p = new Project();
        p.setId(1);
        p.setName("test");
        when(projectRepository.findById(1)).thenReturn(p);
        doNothing().when(projectRepository).deleteById(1);
        projectService.delete(1);
        verify(projectRepository).deleteById(1);
    }

    @Test
    void delete_projectNotFound_shouldThrow() {
        when(projectRepository.findById(999)).thenReturn(null);

        assertThrows(dev.mozhno.exception.NotFoundException.class, () -> projectService.delete(999));
    }

    @Test
    void uploadLogo_shouldStoreLogoData() throws IOException {
        Project p = new Project();
        p.setId(1);
        p.setName("Logo Project");
        p.setLogo("blob.png");
        when(projectRepository.findById(1)).thenReturn(p);
        doNothing().when(projectRepository).updateLogo(eq(1), matches("blob-.+\\.png"), any(byte[].class));
        when(projectRepository.findById(1)).thenReturn(p);

        MockMultipartFile file = new MockMultipartFile("logo", "logo.png", "image/png", pngBytes());

        Project result = projectService.uploadLogo(1, file);

        verify(projectRepository).updateLogo(eq(1), matches("blob-.+\\.png"), any(byte[].class));
        assertNotNull(result);
    }

    @Test
    void uploadLogo_projectNotFound_shouldThrow() {
        when(projectRepository.findById(999)).thenReturn(null);

        MockMultipartFile file = new MockMultipartFile("logo", "logo.png", "image/png", pngBytes());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> projectService.uploadLogo(999, file));
        assertTrue(ex.getMessage().contains("Project not found"));
    }

    @Test
    void uploadLogo_derivesExtensionFromContent_notFilename() throws IOException {
        Project p = new Project();
        p.setId(2);
        p.setName("NoExt Project");
        p.setLogo("blob.png");
        when(projectRepository.findById(2)).thenReturn(p);
        doNothing().when(projectRepository).updateLogo(eq(2), matches("blob-.+\\.png"), any(byte[].class));

        // Filename has no extension, but the PNG magic bytes drive the stored extension.
        MockMultipartFile file = new MockMultipartFile("logo", "logofile", "image/png", pngBytes());

        projectService.uploadLogo(2, file);

        verify(projectRepository).updateLogo(eq(2), matches("blob-.+\\.png"), any(byte[].class));
    }

    @Test
    void uploadLogo_jpegContent_storesJpgExtension() throws IOException {
        Project p = new Project();
        p.setId(3);
        p.setName("Jpeg Project");
        p.setLogo("blob.jpg");
        when(projectRepository.findById(3)).thenReturn(p);
        doNothing().when(projectRepository).updateLogo(eq(3), matches("blob-.+\\.jpg"), any(byte[].class));

        MockMultipartFile file = new MockMultipartFile("logo", null, "image/jpeg", jpegBytes());

        projectService.uploadLogo(3, file);

        verify(projectRepository).updateLogo(eq(3), matches("blob-.+\\.jpg"), any(byte[].class));
    }

    @Test
    void uploadLogo_nonImageOrSvg_shouldReject() {
        Project p = new Project();
        p.setId(4);
        p.setName("Bad Upload");
        when(projectRepository.findById(4)).thenReturn(p);

        MockMultipartFile svg = new MockMultipartFile("logo", "logo.svg", "image/svg+xml",
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>".getBytes());

        assertThrows(dev.mozhno.exception.BadRequestException.class, () -> projectService.uploadLogo(4, svg));
        verify(projectRepository, never()).updateLogo(eq(4), any(), any(byte[].class));
    }

    private static byte[] pngBytes() {
        return new byte[]{(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10, 0, 0, 0, 0};
    }

    private static byte[] jpegBytes() {
        return new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 16, 'J', 'F'};
    }

    @Test
    void getLogoData_shouldReturnBytes() {
        Project p = new Project();
        p.setId(1);
        p.setLogo("blob.png");
        when(projectRepository.findById(1)).thenReturn(p);
        when(projectRepository.getLogoData(1)).thenReturn(new byte[]{1, 2, 3});

        byte[] result = projectService.getLogoData(1);

        assertNotNull(result);
        assertEquals(3, result.length);
    }

    @Test
    void getLogoData_projectNotFound_shouldReturnNull() {
        when(projectRepository.findById(999)).thenReturn(null);

        byte[] result = projectService.getLogoData(999);

        assertNull(result);
    }

    @Test
    void getLogoData_nullLogo_shouldReturnNull() {
        Project p = new Project();
        p.setId(1);
        p.setLogo(null);
        when(projectRepository.findById(1)).thenReturn(p);

        byte[] result = projectService.getLogoData(1);

        assertNull(result);
    }

    @Test
    void getLogoData_emptyLogo_shouldReturnNull() {
        Project p = new Project();
        p.setId(1);
        p.setLogo("");
        when(projectRepository.findById(1)).thenReturn(p);

        byte[] result = projectService.getLogoData(1);

        assertNull(result);
    }
}