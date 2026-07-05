package dev.mozhno.projects;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import dev.mozhno.auth.UserPrincipal;
import dev.mozhno.client.ClientInstance;
import dev.mozhno.client.ClientInstanceService;

import dev.mozhno.util.MediaTypeUtils;

import java.util.List;

/**
 * REST controller for managing projects.
 * A project is the top-level organizational unit that owns flags,
 * environments, segments, and other configuration resources.
 *
 * <p><b>Project scoping:</b> the active project is carried in the JWT
 * {@code project_id} claim (chosen at login or via {@code /auth/select-project}).
 * Resource controllers (flags, segments, contexts, API keys, audit, …) scope all
 * data by {@code user.projectId()}. This controller also lists project metadata
 * so the UI can offer a project switcher.
 *
 * @see ProjectService
 */
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management")
public class ProjectController {
    private final ProjectService projectService;
    private final ProjectAssembler projectAssembler;
    private final ClientInstanceService clientInstanceService;

    @GetMapping
    @Operation(summary = "Get all projects")
    public List<ProjectResponse> getAll(@AuthenticationPrincipal UserPrincipal user) {
        List<Project> projects = projectService.findAll();
        return projectAssembler.toResponseList(projects);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ProjectResponse getById(@PathVariable Integer id,
                                   @AuthenticationPrincipal UserPrincipal user) {
        Project project = projectService.findById(id);
        return projectAssembler.toResponse(project);
    }

    @GetMapping("/{id}/client-instances")
    @Operation(summary = "List connected SDK instances for a project")
    public List<ClientInstance> getClientInstances(@PathVariable Integer id,
                                                    @RequestParam(required = false) Integer environmentId,
                                                    @AuthenticationPrincipal UserPrincipal user) {
        return clientInstanceService.getInstances(id, environmentId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new project")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectResponse create(@Valid @RequestBody ProjectRequest request,
                                  @AuthenticationPrincipal UserPrincipal user) {
        Project project = projectService.create(request);
        return projectAssembler.toResponse(project);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a project")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectResponse update(@PathVariable Integer id, @Valid @RequestBody ProjectRequest request,
                                  @AuthenticationPrincipal UserPrincipal user) {
        Project project = projectService.update(id, request);
        return projectAssembler.toResponse(project);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a project")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        projectService.delete(id);
    }

    @PostMapping("/{id}/logo")
    @Operation(summary = "Upload a logo image for a project")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectResponse uploadLogo(@PathVariable Integer id,
                                      @RequestParam("file") MultipartFile file,
                                      @AuthenticationPrincipal UserPrincipal user) {
        Project project = projectService.uploadLogo(id, file);
        return projectAssembler.toResponse(project);
    }

    @GetMapping("/{id}/logo")
    @Operation(summary = "Get the logo image for a project")
    public ResponseEntity<byte[]> getLogo(@PathVariable Integer id,
                                           @AuthenticationPrincipal UserPrincipal user) {
        byte[] data = projectService.getLogoData(id);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return MediaTypeUtils.imageResponse(data);
    }
}
