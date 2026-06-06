package ru.mozhno.environments;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/environments")
@RequiredArgsConstructor
@Tag(name = "Environments", description = "Environment management per project")
public class EnvironmentController {
    private final EnvironmentService environmentService;

    @GetMapping
    @Operation(summary = "Get all environments for a project")
    public List<Environment> getAll(@PathVariable Integer projectId,
                                    @AuthenticationPrincipal UserPrincipal user) {
        return environmentService.findByProjectId(projectId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an environment")
    @PreAuthorize("hasRole('ADMIN')")
    public Environment create(@PathVariable Integer projectId, @RequestBody Map<String, String> body,
                              @AuthenticationPrincipal UserPrincipal user) {
        return environmentService.create(projectId, body.get("name"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an environment")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        environmentService.delete(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get environment by ID")
    public Environment getById(@PathVariable Integer id,
                               @AuthenticationPrincipal UserPrincipal user) {
        return environmentService.findById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an environment")
    @PreAuthorize("hasRole('ADMIN')")
    public Environment update(@PathVariable Integer id, @RequestBody Map<String, String> body,
                              @AuthenticationPrincipal UserPrincipal user) {
        return environmentService.update(id, body.get("name"));
    }
}