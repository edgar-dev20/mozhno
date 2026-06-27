package dev.mozhno.environments;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.auth.UserPrincipal;
import dev.mozhno.exception.BadRequestException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/environments")
@RequiredArgsConstructor
@Tag(name = "Environments", description = "Environment management per project")
public class EnvironmentController {
    private final EnvironmentService environmentService;
    private final EnvironmentAssembler environmentAssembler;

    @GetMapping
    @Operation(summary = "Get all environments for a project")
    public List<EnvironmentResponse> getAll(@AuthenticationPrincipal UserPrincipal user) {
        List<Environment> envs = environmentService.findByProjectId(user.projectId());
        return environmentAssembler.toResponseList(envs);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an environment")
    @PreAuthorize("hasRole('ADMIN')")
    public EnvironmentResponse create(@RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal UserPrincipal user) {
        String name = requireName(body);
        Environment env = environmentService.create(user.projectId(), name);
        return environmentAssembler.toResponse(env);
    }

    @GetMapping("/limit")
    @Operation(summary = "Get max environments limit")
    public Map<String, Integer> getLimit() {
        return Map.of("maxEnvironments", 3);
    }

    @DeleteMapping("/{id:\\d+}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an environment")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        environmentService.delete(id, user.projectId());
    }

    @GetMapping("/{id:\\d+}")
    @Operation(summary = "Get environment by ID")
    public EnvironmentResponse getById(@PathVariable Integer id,
                                       @AuthenticationPrincipal UserPrincipal user) {
        Environment env = environmentService.findById(id, user.projectId());
        return environmentAssembler.toResponse(env);
    }

    @PutMapping("/{id:\\d+}")
    @Operation(summary = "Update an environment")
    @PreAuthorize("hasRole('ADMIN')")
    public EnvironmentResponse update(@PathVariable Integer id,
                                      @RequestBody Map<String, String> body,
                                      @AuthenticationPrincipal UserPrincipal user) {
        String name = requireName(body);
        Environment env = environmentService.update(id, name, user.projectId());
        return environmentAssembler.toResponse(env);
    }

    private static String requireName(Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Environment name is required");
        }
        return name;
    }
}
