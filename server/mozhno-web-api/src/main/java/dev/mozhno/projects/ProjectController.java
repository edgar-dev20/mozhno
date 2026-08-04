package dev.mozhno.projects;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import dev.mozhno.auth.UserPrincipal;
import dev.mozhno.client.ClientInstance;
import dev.mozhno.client.ClientInstanceService;

import dev.mozhno.util.MediaTypeUtils;

import java.util.List;

/**
 * REST controller for managing projects.
 * The project ID is taken from the JWT ({@code project_id} claim) — no path variable needed.
 *
 * <p>A project is created once (during bootstrap or invite acceptance)
 * and cannot be deleted — only reset to factory defaults via {@code POST /reset}.
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
    @Operation(summary = "Get the current user's project")
    public List<ProjectResponse> getAll(@AuthenticationPrincipal UserPrincipal user) {
        Integer projectId = user.projectId();
        if (projectId == null) return List.of();
        Project project = projectService.findById(projectId);
        return projectAssembler.toResponseList(List.of(project));
    }

    @GetMapping("/client-instances")
    @Operation(summary = "List connected SDK instances for the current project")
    public List<ClientInstance> getClientInstances(@RequestParam(required = false) Integer environmentId,
                                                    @AuthenticationPrincipal UserPrincipal user) {
        return clientInstanceService.getInstances(user.projectId(), environmentId);
    }

    @GetMapping("/logo")
    @Operation(summary = "Get the logo image for the current project")
    public ResponseEntity<byte[]> getLogo(@AuthenticationPrincipal UserPrincipal user) {
        byte[] data = projectService.getLogoData(user.projectId());
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return MediaTypeUtils.imageResponse(data);
    }

    @PutMapping
    @Operation(summary = "Update the current project")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectResponse update(@Valid @RequestBody ProjectRequest request,
                                  @AuthenticationPrincipal UserPrincipal user) {
        Project project = projectService.update(user.projectId(), request);
        return projectAssembler.toResponse(project);
    }

    @PostMapping("/reset")
    @Operation(summary = "Reset project to factory defaults (clears all flags, segments, contexts, API keys)")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectResponse reset(@AuthenticationPrincipal UserPrincipal user) {
        Project project = projectService.reset(user.projectId());
        return projectAssembler.toResponse(project);
    }

    @PostMapping("/logo")
    @Operation(summary = "Upload a logo image for the current project")
    @PreAuthorize("hasRole('ADMIN')")
    public ProjectResponse uploadLogo(@RequestParam("file") MultipartFile file,
                                      @AuthenticationPrincipal UserPrincipal user) {
        Project project = projectService.uploadLogo(user.projectId(), file);
        return projectAssembler.toResponse(project);
    }
}
