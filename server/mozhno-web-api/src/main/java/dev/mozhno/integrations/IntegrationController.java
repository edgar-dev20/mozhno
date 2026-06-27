package dev.mozhno.integrations;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.auth.UserPrincipal;

import java.util.List;
import java.util.Map;

import dev.mozhno.spi.WebhookLimitSpi;

@RestController
@RequestMapping("/api/v1/integrations")
@RequiredArgsConstructor
@Tag(name = "Integrations", description = "Custom webhook integrations for event delivery")
public class IntegrationController {
    private final IntegrationService integrationService;
    private final IntegrationAssembler integrationAssembler;
    private final WebhookLimitSpi webhookLimitSpi;

    @GetMapping
    @Operation(summary = "Get all integrations for a project")
    public List<IntegrationResponse> getAll(@AuthenticationPrincipal UserPrincipal user) {
        List<Integration> integrations = integrationService.findByProjectId(user.projectId());
        return integrationAssembler.toResponseList(integrations);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get integration by ID")
    public IntegrationResponse getById(@PathVariable Integer id,
                                       @AuthenticationPrincipal UserPrincipal user) {
        Integration integration = integrationService.findById(id, user.projectId());
        return integrationAssembler.toResponse(integration);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an integration (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public IntegrationResponse create(@Valid @RequestBody IntegrationRequest request,
                                      @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        Integration integration = integrationService.create(request);
        return integrationAssembler.toResponse(integration);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an integration (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public IntegrationResponse update(@PathVariable Integer id,
                                      @Valid @RequestBody IntegrationRequest request,
                                      @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        Integration integration = integrationService.update(id, request, user.projectId());
        return integrationAssembler.toResponse(integration);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an integration (admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        integrationService.delete(id, user.projectId());
    }

    @GetMapping("/webhook-limit")
    @Operation(summary = "Get remaining webhook delivery quota for the project")
    public Map<String, Long> getWebhookLimit(@AuthenticationPrincipal UserPrincipal user) {
        Integer projectId = user.projectId();
        if (projectId == null) return Map.of("remaining", 0L);
        return Map.of("remaining", webhookLimitSpi.getRemaining(projectId));
    }
}
