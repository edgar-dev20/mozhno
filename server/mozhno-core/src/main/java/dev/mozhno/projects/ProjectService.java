package dev.mozhno.projects;

import dev.mozhno.ContextType;
import dev.mozhno.apikeys.ApiKeyRepository;
import dev.mozhno.audit.AuditEventRepository;
import dev.mozhno.contexts.ContextDefinitionRepository;
import dev.mozhno.contexts.ContextDefinitionRequest;
import dev.mozhno.contexts.ContextService;
import dev.mozhno.contexts.ContextValueRepository;
import dev.mozhno.environments.EnvironmentRepository;
import dev.mozhno.environments.EnvironmentService;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.NotFoundException;
import dev.mozhno.flags.FlagRepository;
import dev.mozhno.flags.FlagTagValueRepository;
import dev.mozhno.flags.strategy.FlagStrategyRepository;
import dev.mozhno.integrations.IntegrationRepository;
import dev.mozhno.segments.SegmentContextRepository;
import dev.mozhno.segments.SegmentRepository;
import dev.mozhno.settings.ProjectSettingsRepository;
import dev.mozhno.tags.TagRepository;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static dev.mozhno.util.MediaTypeUtils.*;

/**
 * Service for managing projects, the top-level organizational unit.
 * Projects are created once (bootstrap or invite) and never deleted.
 * Use {@link #reset(Integer)} to clear all project data.
 */
@Service
public class ProjectService {
    private static final long MAX_LOGO_PIXELS = 1024L * 1024L;
    private static final String DEFAULT_PROJECT_NAME = "My Project";
    private final ProjectRepository projectRepository;
    private final DomainEventPublisher events;
    private final EnvironmentService environmentService;
    private final ContextService contextService;
    private final FlagRepository flagRepository;
    private final FlagStrategyRepository flagStrategyRepository;
    private final FlagTagValueRepository flagTagValueRepository;
    private final SegmentRepository segmentRepository;
    private final SegmentContextRepository segmentContextRepository;
    private final ContextDefinitionRepository contextDefinitionRepository;
    private final ContextValueRepository contextValueRepository;
    private final TagRepository tagRepository;
    private final EnvironmentRepository environmentRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final AuditEventRepository auditEventRepository;
    private final IntegrationRepository integrationRepository;
    private final ProjectSettingsRepository projectSettingsRepository;

    @SuppressWarnings("java:S107")
    public ProjectService(ProjectRepository projectRepository,
                          DomainEventPublisher events,
                          EnvironmentService environmentService,
                          ContextService contextService,
                          FlagRepository flagRepository,
                          FlagStrategyRepository flagStrategyRepository,
                          FlagTagValueRepository flagTagValueRepository,
                          SegmentRepository segmentRepository,
                          SegmentContextRepository segmentContextRepository,
                          ContextDefinitionRepository contextDefinitionRepository,
                          ContextValueRepository contextValueRepository,
                          TagRepository tagRepository,
                          EnvironmentRepository environmentRepository,
                          ApiKeyRepository apiKeyRepository,
                          AuditEventRepository auditEventRepository,
                          IntegrationRepository integrationRepository,
                          ProjectSettingsRepository projectSettingsRepository) {
        this.projectRepository = projectRepository;
        this.events = events;
        this.environmentService = environmentService;
        this.contextService = contextService;
        this.flagRepository = flagRepository;
        this.flagStrategyRepository = flagStrategyRepository;
        this.flagTagValueRepository = flagTagValueRepository;
        this.segmentRepository = segmentRepository;
        this.segmentContextRepository = segmentContextRepository;
        this.contextDefinitionRepository = contextDefinitionRepository;
        this.contextValueRepository = contextValueRepository;
        this.tagRepository = tagRepository;
        this.environmentRepository = environmentRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.auditEventRepository = auditEventRepository;
        this.integrationRepository = integrationRepository;
        this.projectSettingsRepository = projectSettingsRepository;
    }

    @Transactional(readOnly = true)
    public Project findById(Integer id) {
        Project p = projectRepository.findById(id);
        if (p == null) {
            throw new NotFoundException("Project", id);
        }
        return p;
    }

    @Transactional
    public Project update(Integer id, ProjectRequest request) {
        Project p = projectRepository.findById(id);
        if (p == null) {
            throw new NotFoundException("Project", id);
        }
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        Project saved = projectRepository.save(p);
        events.publish(DomainEvent.of(saved.getId(), "project.updated", "project",
            saved.getId(), saved.getName(), "Project updated"));
        return saved;
    }

    /**
     * Resets a project to factory defaults: clears all flags, segments, contexts,
     * API keys, integrations, audit log, and recreates default environments.
     * Project name is reset to "My Project" and logo is removed.
     * User assignments to the project are preserved.
     */
    @Transactional
    public Project reset(Integer id) {
        Project p = projectRepository.findById(id);
        if (p == null) {
            throw new NotFoundException("Project", id);
        }

        auditEventRepository.deleteByProjectId(id);
        integrationRepository.deleteByProjectId(id);
        projectSettingsRepository.deleteByProjectId(id);
        apiKeyRepository.deleteByProjectId(id);
        flagTagValueRepository.deleteByProjectId(id);
        flagStrategyRepository.deleteByProjectId(id);
        flagRepository.deleteByProjectId(id);
        segmentContextRepository.deleteByProjectId(id);
        segmentRepository.deleteByProjectId(id);
        contextValueRepository.deleteByProjectId(id);
        contextDefinitionRepository.deleteByProjectId(id);
        tagRepository.deleteByProjectId(id);
        environmentRepository.deleteByProjectId(id);

        p.setName(DEFAULT_PROJECT_NAME);
        p.setDescription(null);
        p.setLogo(null);
        projectRepository.updateLogo(id, null, null);
        projectRepository.save(p);

        environmentService.create(id, "Production", null, null, false);
        environmentService.create(id, "Staging", null, null, false);
        environmentService.create(id, "Development", null, null, false);
        ContextDefinitionRequest ctxRequest = new ContextDefinitionRequest();
        ctxRequest.setProjectId(id);
        ctxRequest.setName("userId");
        ctxRequest.setKey("user_id");
        ctxRequest.setType(ContextType.STRING.getValue());
        ctxRequest.setDescription("User identifier");
        contextService.createDefinition(ctxRequest, null);

        events.publish(DomainEvent.of(id, "project.reset", "project",
            id, DEFAULT_PROJECT_NAME, "Project reset to factory defaults"));
        return projectRepository.findById(id);
    }

    @Transactional
    public Project uploadLogo(Integer id, MultipartFile file) {
        Project p = projectRepository.findById(id);
        if (p == null) {
            throw new NotFoundException("Project", id);
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Failed to read logo file: " + e.getMessage());
        }
        MediaType type = detectRasterImageType(bytes);
        if (type == null) {
            throw new BadRequestException("UNSUPPORTED_IMAGE_FORMAT",
                "Only PNG, JPEG, GIF or WEBP images are allowed");
        }
        int[] dims;
        try {
            dims = readDimensions(bytes);
        } catch (IOException e) {
            throw new BadRequestException("IMAGE_READ_ERROR", "Failed to read image");
        }
        if (dims == null) {
            throw new BadRequestException("IMAGE_READ_ERROR", "Failed to read image");
        }
        long pixels = (long) dims[0] * (long) dims[1];
        if (pixels > MAX_LOGO_PIXELS) {
            throw new BadRequestException("IMAGE_TOO_LARGE",
                dims[0] + "x" + dims[1] + " px. Max: 1024x1024 px");
        }
        String filename = "blob-" + System.currentTimeMillis() + "-"
            + Integer.toHexString(java.util.concurrent.ThreadLocalRandom.current().nextInt())
            + extensionFor(type);
        projectRepository.updateLogo(id, filename, bytes);
        Project saved = projectRepository.findById(id);
        events.publish(DomainEvent.of(saved.getId(), "project.logo_updated", "project",
            saved.getId(), saved.getName(), "Logo updated"));
        return saved;
    }

    @Transactional(readOnly = true)
    public byte[] getLogoData(Integer id) {
        Project p = projectRepository.findById(id);
        if (p == null || p.getLogo() == null || p.getLogo().isEmpty()) {
            return null;
        }
        return projectRepository.getLogoData(id);
    }
}
