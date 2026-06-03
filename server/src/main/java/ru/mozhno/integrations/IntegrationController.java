package ru.mozhno.integrations;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/integrations")
@Tag(name = "Integrations", description = "Notification integrations (email, telegram, mattermost, webhook)")
public class IntegrationController {
    private final IntegrationService integrationService;

    public IntegrationController(IntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    @GetMapping
    @Operation(summary = "Get all integrations for a project")
    public List<Integration> getAll(@PathVariable Integer projectId,
                                    @AuthenticationPrincipal UserPrincipal user) {
        return integrationService.findByProjectId(projectId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get integration by ID")
    public Integration getById(@PathVariable Integer id,
                               @AuthenticationPrincipal UserPrincipal user) {
        return integrationService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an integration (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public Integration create(@PathVariable Integer projectId, @RequestBody IntegrationRequest request,
                              @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(projectId);
        return integrationService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an integration (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public Integration update(@PathVariable Integer id, @RequestBody IntegrationRequest request,
                              @AuthenticationPrincipal UserPrincipal user) {
        return integrationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an integration (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        integrationService.delete(id);
    }
}