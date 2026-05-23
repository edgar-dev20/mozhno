package ru.mozhno.environments;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
    public List<Environment> getAll(@PathVariable Integer projectId) {
        return environmentService.findByProjectId(projectId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an environment")
    public Environment create(@PathVariable Integer projectId, @RequestBody Map<String, String> body) {
        return environmentService.create(projectId, body.get("name"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an environment")
    public void delete(@PathVariable Integer id) {
        environmentService.delete(id);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get environment by ID")
    public Environment getById(@PathVariable Integer id) {
        return environmentService.findById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an environment")
    public Environment update(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        return environmentService.update(id, body.get("name"));
    }
}