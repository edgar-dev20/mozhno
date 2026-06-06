package ru.mozhno.client;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.security.ApiKeyAuthentication;

import java.util.List;

@RestController
@RequestMapping("/api/client")
@Tag(name = "Client", description = "Client SDK API — requires API key via Bearer token")
public class ClientFlagController {
    private final ClientFlagService clientFlagService;

    public ClientFlagController(ClientFlagService clientFlagService) {
        this.clientFlagService = clientFlagService;
    }

    @GetMapping("/features")
    @Operation(summary = "Get all feature flags for the authenticated project", security = @SecurityRequirement(name = "ApiKeyAuth"))
    public List<ClientFlagResponse> getFeatures() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof ApiKeyAuthentication apiKeyAuth)) {
            throw new RuntimeException("Unauthorized");
        }
        return clientFlagService.getFlagsForProject(apiKeyAuth.getProjectId(), apiKeyAuth.getEnvironmentId());
    }
}