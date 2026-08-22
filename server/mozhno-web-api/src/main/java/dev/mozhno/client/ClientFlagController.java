package dev.mozhno.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.micrometer.core.annotation.Timed;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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
    private static final Logger log = LoggerFactory.getLogger(ClientFlagController.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private final ClientFlagService clientFlagService;
    private final ClientInstanceService clientInstanceService;

    @GetMapping("/features")
    @Operation(summary = "Get all feature flags for the authenticated project", security = @SecurityRequirement(name = "ApiKeyAuth"))
    @Timed(value = "client.flags.fetch", description = "Time taken to fetch feature flags for SDK clients")
    public ResponseEntity<List<ClientFlagResponse>> getFeatures(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof ApiKeyAuthentication apiKeyAuth)) {
            throw new AccessDeniedException("Invalid API key authentication");
        }
        recordInstance(apiKeyAuth, request);

        List<ClientFlagResponse> flags = clientFlagService.getFlagsForProject(
            apiKeyAuth.getProjectId(), apiKeyAuth.getEnvironmentId());

        String etag = computeEtag(flags);
        String ifNoneMatch = request.getHeader("If-None-Match");
        if (ifNoneMatch != null && etag.equals(ifNoneMatch.trim())) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).eTag(etag).build();
        }
        return ResponseEntity.ok().eTag(etag).body(flags);
    }

    private static String computeEtag(List<ClientFlagResponse> flags) {
        try {
            String json = MAPPER.writeValueAsString(flags);
            return "\"" + Integer.toHexString(json.hashCode()) + "\"";
        } catch (Exception e) {
            log.warn("Failed to compute ETag", e);
            return "\"0\"";
        }
    }

    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate flags against context (client-side SDK)", security = @SecurityRequirement(name = "ApiKeyAuth"))
    @Timed(value = "client.flags.evaluate", description = "Time taken to evaluate flags with context")
    public ResponseEntity<ClientEvaluateResponse> evaluate(@Valid @RequestBody ClientEvaluateRequest req, HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof ApiKeyAuthentication apiKeyAuth)) {
            throw new AccessDeniedException("Invalid API key authentication");
        }
        Long instanceId = recordInstance(apiKeyAuth, request);
        Map<String, String> context = req.getContext() != null ? req.getContext() : Collections.emptyMap();
        List<String> requestedToggles = req.getToggles();

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(
            apiKeyAuth.getProjectId(), apiKeyAuth.getEnvironmentId(), context, instanceId, requestedToggles);

        return ResponseEntity.ok(new ClientEvaluateResponse(results));
    }

    @PostMapping("/metrics")
    @Operation(summary = "Submit SDK usage metrics", security = @SecurityRequirement(name = "ApiKeyAuth"))
    @Timed(value = "client.metrics.submit", description = "Time taken to record SDK metrics")
    public ResponseEntity<Void> submitMetrics(@Valid @RequestBody ClientMetricsRequest req, HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof ApiKeyAuthentication apiKeyAuth)) {
            throw new AccessDeniedException("Invalid API key authentication");
        }
        Long instanceId = recordInstance(apiKeyAuth, request);
        clientFlagService.recordMetrics(apiKeyAuth.getProjectId(), apiKeyAuth.getEnvironmentId(), req, instanceId);
        return ResponseEntity.accepted().build();
    }

    private Long recordInstance(ApiKeyAuthentication auth, HttpServletRequest request) {
        String appName = request.getHeader("X-Mozhno-App-Name");
        String instanceId = request.getHeader("X-Mozhno-Instance-Id");
        if (appName != null && instanceId != null) {
            String sdkType = request.getHeader("X-Mozhno-Sdk-Type");
            String sdkVersion = request.getHeader("X-Mozhno-Sdk-Version");
            log.debug("Recording instance: app={}, instance={}, sdkType={}, sdkVersion={}",
                appName, instanceId, sdkType, sdkVersion);
            return clientInstanceService.record(auth.getProjectId(), auth.getEnvironmentId(),
                null, appName, instanceId, sdkType != null ? sdkType : "unknown",
                sdkVersion, auth.getKeyType());
        }
        return null;
    }
}