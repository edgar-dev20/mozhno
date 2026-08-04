package dev.mozhno.services;

import dev.mozhno.ContextType;
import dev.mozhno.apikeys.ApiKeyRepository;
import dev.mozhno.audit.AuditEventRepository;
import dev.mozhno.contexts.ContextDefinitionRepository;
import dev.mozhno.contexts.ContextDefinitionRequest;
import dev.mozhno.contexts.ContextService;
import dev.mozhno.contexts.ContextValueRepository;
import dev.mozhno.environments.EnvironmentRepository;
import dev.mozhno.environments.EnvironmentService;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.NotFoundException;
import dev.mozhno.flags.FlagRepository;
import dev.mozhno.flags.FlagTagValueRepository;
import dev.mozhno.flags.strategy.FlagStrategyRepository;
import dev.mozhno.integrations.IntegrationRepository;
import dev.mozhno.projects.Project;
import dev.mozhno.projects.ProjectRepository;
import dev.mozhno.projects.ProjectRequest;
import dev.mozhno.projects.ProjectService;
import dev.mozhno.segments.SegmentContextRepository;
import dev.mozhno.segments.SegmentRepository;
import dev.mozhno.settings.ProjectSettingsRepository;
import dev.mozhno.tags.TagRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private DomainEventPublisher events;
    @Mock private EnvironmentService environmentService;
    @Mock private ContextService contextService;
    @Mock private FlagRepository flagRepository;
    @Mock private FlagStrategyRepository flagStrategyRepository;
    @Mock private FlagTagValueRepository flagTagValueRepository;
    @Mock private SegmentRepository segmentRepository;
    @Mock private SegmentContextRepository segmentContextRepository;
    @Mock private ContextDefinitionRepository contextDefinitionRepository;
    @Mock private ContextValueRepository contextValueRepository;
    @Mock private TagRepository tagRepository;
    @Mock private EnvironmentRepository environmentRepository;
    @Mock private ApiKeyRepository apiKeyRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private IntegrationRepository integrationRepository;
    @Mock private ProjectSettingsRepository projectSettingsRepository;

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectService(projectRepository, events, environmentService, contextService,
            flagRepository, flagStrategyRepository, flagTagValueRepository,
            segmentRepository, segmentContextRepository,
            contextDefinitionRepository, contextValueRepository,
            tagRepository, environmentRepository,
            apiKeyRepository, auditEventRepository, integrationRepository, projectSettingsRepository);
    }

    @Test
    void findById_shouldReturnProject() {
        Project project = new Project();
        project.setId(1);
        project.setName("Test");
        when(projectRepository.findById(1)).thenReturn(project);
        assertEquals(project, projectService.findById(1));
    }

    @Test
    void findById_shouldThrowWhenNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);
        assertThrows(NotFoundException.class, () -> projectService.findById(999));
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
        request.setDescription("Desc");

        Project result = projectService.update(1, request);
        assertEquals("New Name", result.getName());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void update_shouldThrowWhenNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);
        ProjectRequest request = new ProjectRequest();
        request.setName("X");
        assertThrows(NotFoundException.class, () -> projectService.update(999, request));
    }

    @Test
    void reset_shouldClearAllDataAndRecreateDefaults() {
        Project project = new Project();
        project.setId(1);
        project.setName("Old Project");
        when(projectRepository.findById(1)).thenReturn(project);
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        projectService.reset(1);

        verify(auditEventRepository).deleteByProjectId(1);
        verify(integrationRepository).deleteByProjectId(1);
        verify(projectSettingsRepository).deleteByProjectId(1);
        verify(apiKeyRepository).deleteByProjectId(1);
        verify(flagTagValueRepository).deleteByProjectId(1);
        verify(flagStrategyRepository).deleteByProjectId(1);
        verify(flagRepository).deleteByProjectId(1);
        verify(segmentContextRepository).deleteByProjectId(1);
        verify(segmentRepository).deleteByProjectId(1);
        verify(contextValueRepository).deleteByProjectId(1);
        verify(contextDefinitionRepository).deleteByProjectId(1);
        verify(tagRepository).deleteByProjectId(1);
        verify(environmentRepository).deleteByProjectId(1);
        verify(environmentService).create(eq(1), eq("Production"), isNull(), isNull(), eq(false));
        verify(environmentService).create(eq(1), eq("Staging"), isNull(), isNull(), eq(false));
        verify(environmentService).create(eq(1), eq("Development"), isNull(), isNull(), eq(false));
        verify(contextService).createDefinition(any(ContextDefinitionRequest.class), isNull());
    }

    @Test
    void reset_shouldThrowWhenNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);
        assertThrows(NotFoundException.class, () -> projectService.reset(999));
    }

    @Test
    void getLogoData_shouldReturnNullWhenNoLogo() {
        Project project = new Project();
        project.setId(1);
        project.setLogo(null);
        when(projectRepository.findById(1)).thenReturn(project);
        assertNull(projectService.getLogoData(1));
    }

    @Test
    void getLogoData_shouldReturnNullWhenProjectNotFound() {
        when(projectRepository.findById(999)).thenReturn(null);
        assertNull(projectService.getLogoData(999));
    }
}
