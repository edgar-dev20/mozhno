package ru.mozhno.environments;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/environments")
@RequiredArgsConstructor
@Tag(name = "Environments", description = "Environment management per project")
public class EnvironmentController {
    private final EnvironmentService environmentService;

    @GetMapping
    @Operation(summary = "Get all environments for a project")
    public List<Environment> getAll(@PathVariable Integer projectId) {
        return environmentService.findByProjectId(projectId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an environment")
    public Environment create(@PathVariable Integer projectId, @RequestParam String name) {
        return environmentService.create(projectId, name);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an environment")
    public void delete(@PathVariable Integer id) {
        environmentService.delete(id);
    }
}