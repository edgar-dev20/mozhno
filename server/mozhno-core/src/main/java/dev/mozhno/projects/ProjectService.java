package dev.mozhno.projects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import dev.mozhno.ContextType;
import dev.mozhno.contexts.ContextDefinitionRequest;
import dev.mozhno.contexts.ContextService;
import dev.mozhno.environments.EnvironmentService;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.NotFoundException;

import java.io.IOException;
import java.util.List;

/**
 * Service for managing projects, the top-level organizational unit.
 */
@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final DomainEventPublisher events;
    private final EnvironmentService environmentService;
    private final ContextService contextService;

    public ProjectService(ProjectRepository projectRepository,
                          DomainEventPublisher events,
                          EnvironmentService environmentService,
                          ContextService contextService) {
        this.projectRepository = projectRepository;
        this.events = events;
        this.environmentService = environmentService;
        this.contextService = contextService;
    }

    /**
     * Returns all projects.
     *
     * @return list of all projects
     */
    @Transactional(readOnly = true)
    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    /**
     * Finds a project by its ID.
     *
     * @param id the project ID
     * @return the project
     * @throws RuntimeException if not found
     */
    @Transactional(readOnly = true)
    public Project findById(Integer id) {
        Project p = projectRepository.findById(id);
        if (p == null) {
            throw new NotFoundException("Project", id);
        }
        return p;
    }

    /**
     * Creates a new project.
     *
     * @param request the project creation request
     * @return the created project
     */
    @Transactional
    public Project create(ProjectRequest request) {
        Project p = new Project();
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        Project saved = projectRepository.save(p);
        environmentService.create(saved.getId(), "Production");
        environmentService.create(saved.getId(), "Development");
        ContextDefinitionRequest ctxRequest = new ContextDefinitionRequest();
        ctxRequest.setProjectId(saved.getId());
        ctxRequest.setName("userId");
        ctxRequest.setKey("user_id");
        ctxRequest.setType(ContextType.STRING.getValue());
        ctxRequest.setDescription("User identifier");
        contextService.createDefinition(ctxRequest, null);
        events.publish(DomainEvent.of(saved.getId(), "project.created", "project",
            saved.getId(), saved.getName(), "Project created"));
        return saved;
    }

    /**
     * Updates an existing project.
     *
     * @param id the project ID
     * @param request the project update request
     * @return the updated project
     * @throws RuntimeException if not found
     */
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
     * Deletes a project by its ID.
     *
     * @param id the project ID
     */
    @Transactional
    public void delete(Integer id) {
        Project p = projectRepository.findById(id);
        if (p == null) throw new NotFoundException("Project", id);
        projectRepository.deleteById(id);
        events.publish(DomainEvent.of(id, "project.deleted", "project",
            id, p.getName(), "Project deleted"));
    }

    /**
     * Uploads a logo image for a project, storing bytes in the database.
     *
     * @param id   the project ID
     * @param file the uploaded image file
     * @return the updated project
     */
    @Transactional
    public Project uploadLogo(Integer id, MultipartFile file) {
        Project p = projectRepository.findById(id);
        if (p == null) {
            throw new NotFoundException("Project", id);
        }
        try {
            byte[] bytes = file.getBytes();
            String ext = dev.mozhno.util.FileUtils.getExtension(file.getOriginalFilename());
            projectRepository.updateLogo(id, "blob" + ext, bytes);
        } catch (IOException e) {
            throw new BadRequestException("Failed to read logo file: " + e.getMessage());
        }
        Project saved = projectRepository.findById(id);
        events.publish(DomainEvent.of(saved.getId(), "project.logo_updated", "project",
            saved.getId(), saved.getName(), "Logo updated"));
        return saved;
    }

    /**
     * Returns the logo binary data for a project.
     *
     * @param id the project ID
     * @return logo bytes, or null if no logo is set
     */
    @Transactional(readOnly = true)
    public byte[] getLogoData(Integer id) {
        Project p = projectRepository.findById(id);
        if (p == null || p.getLogo() == null || p.getLogo().isEmpty()) {
            return null;
        }
        return projectRepository.getLogoData(id);
    }
}
