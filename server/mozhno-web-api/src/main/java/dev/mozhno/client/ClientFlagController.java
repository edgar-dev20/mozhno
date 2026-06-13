package dev.mozhno.client;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.micrometer.core.annotation.Timed;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.security.ApiKeyAuthentication;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * REST controller for the client SDK API.
 * Authenticated via API key (Bearer token). Returns feature flags scoped
 * to the project and environment associated with the API key.
 *
 * @see ClientFlagService
 */
@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
@Tag(name = "Client", description = "Client SDK API — requires API key via Bearer token")
public class ClientFlagController {
    private final ClientFlagService clientFlagService;
    private final ClientInstanceService clientInstanceService;

    @GetMapping("/features")
    @Operation(summary = "Get all feature flags for the authenticated project", security = @SecurityRequirement(name = "ApiKeyAuth"))
    @Timed(value = "client.flags.fetch", description = "Time taken to fetch feature flags for SDK clients")
    public List<ClientFlagResponse> getFeatures(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof ApiKeyAuthentication apiKeyAuth)) {
            throw new RuntimeException("Unauthorized");
        }
        recordInstance(apiKeyAuth, request);
        return clientFlagService.getFlagsForProject(apiKeyAuth.getProjectId(), apiKeyAuth.getEnvironmentId());
    }

    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate flags against context (client-side SDK)", security = @SecurityRequirement(name = "ApiKeyAuth"))
    @Timed(value = "client.flags.evaluate", description = "Time taken to evaluate flags with context")
    public ResponseEntity<ClientEvaluateResponse> evaluate(@RequestBody ClientEvaluateRequest req, HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof ApiKeyAuthentication apiKeyAuth)) {
            throw new RuntimeException("Unauthorized");
        }
        recordInstance(apiKeyAuth, request);
        Map<String, String> context = req.getContext() != null ? req.getContext() : Collections.emptyMap();
        List<String> requestedToggles = req.getToggles();

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(
            apiKeyAuth.getProjectId(), apiKeyAuth.getEnvironmentId(), context);

        if (requestedToggles != null && !requestedToggles.isEmpty()) {
            results = results.stream()
                .filter(t -> requestedToggles.contains(t.getName()))
                .toList();
        }

        return ResponseEntity.ok(new ClientEvaluateResponse(results));
    }

    @PostMapping("/metrics")
    @Operation(summary = "Submit SDK usage metrics", security = @SecurityRequirement(name = "ApiKeyAuth"))
    @Timed(value = "client.metrics.submit", description = "Time taken to record SDK metrics")
    public ResponseEntity<Void> submitMetrics(@RequestBody ClientMetricsRequest req, HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof ApiKeyAuthentication apiKeyAuth)) {
            throw new RuntimeException("Unauthorized");
        }
        recordInstance(apiKeyAuth, request);
        clientFlagService.recordMetrics(apiKeyAuth.getProjectId(), apiKeyAuth.getEnvironmentId(), req);
        return ResponseEntity.ok().build();
    }

    private void recordInstance(ApiKeyAuthentication auth, HttpServletRequest request) {
        String appName = request.getHeader("X-Mozhno-App-Name");
        String instanceId = request.getHeader("X-Mozhno-Instance-Id");
        if (appName != null && instanceId != null) {
            clientInstanceService.record(auth.getProjectId(), auth.getEnvironmentId(),
                null, appName, instanceId, "unknown", auth.getKeyType());
        }
    }
}