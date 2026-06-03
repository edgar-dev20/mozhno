package ru.mozhno.projects;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management")
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "Get all projects")
    public List<Project> getAll(@AuthenticationPrincipal UserPrincipal user) {
        return projectService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public Project getById(@PathVariable Integer id,
                           @AuthenticationPrincipal UserPrincipal user) {
        return projectService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new project")
    @PreAuthorize("hasRole('ADMIN')")
    public Project create(@Valid @RequestBody ProjectRequest request,
                          @AuthenticationPrincipal UserPrincipal user) {
        return projectService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a project")
    @PreAuthorize("hasRole('ADMIN')")
    public Project update(@PathVariable Integer id, @Valid @RequestBody ProjectRequest request,
                          @AuthenticationPrincipal UserPrincipal user) {
        return projectService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a project")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        projectService.delete(id);
    }
}