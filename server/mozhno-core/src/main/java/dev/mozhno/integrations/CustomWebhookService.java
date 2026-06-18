package dev.mozhno.integrations;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.mozhno.events.DomainEvent;
import dev.mozhno.spi.WebhookLimitSpi;

@Service
public class CustomWebhookService {

    private static final Logger log = LoggerFactory.getLogger(CustomWebhookService.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final HttpClient httpClient;
    private final TemplateRenderer renderer;
    private final IntegrationRepository repository;
    private final WebhookLimitSpi webhookLimitSpi;

    public CustomWebhookService(HttpClient httpClient, TemplateRenderer renderer,
                                IntegrationRepository repository,
                                WebhookLimitSpi webhookLimitSpi) {
        this.httpClient = httpClient;
        this.renderer = renderer;
        this.repository = repository;
        this.webhookLimitSpi = webhookLimitSpi;
    }

    public void dispatch(Integration integration, DomainEvent event) {
        try {
            Map<String, Object> config = parseConfig(integration.getConfigJson());
            String url = (String) config.get("url");
            if (url == null || url.isBlank()) {
                return;
            }

            URI uri = URI.create(url);
            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                updateStatus(integration, "URL must use HTTPS: " + url);
                return;
            }
            if (!isPublicHost(uri.getHost())) {
                updateStatus(integration, "Blocked non-public host: " + uri.getHost());
                return;
            }

            if (!webhookLimitSpi.tryConsume(integration.getProjectId())) {
                updateStatus(integration, "Webhook delivery limit exceeded");
                return;
            }

            Map<String, String> headers = resolveHeaders(config);
            String bodyTemplate = (String) config.getOrDefault("body", "");
            Map<String, String> context = buildContext(event);
            String renderedBody = renderer.render(bodyTemplate, context);

            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(30))
                .POST(bodyTemplate.isEmpty() && renderedBody.isEmpty()
                    ? HttpRequest.BodyPublishers.noBody()
                    : HttpRequest.BodyPublishers.ofString(renderedBody));

            for (var entry : headers.entrySet()) {
                requestBuilder.header(entry.getKey(), entry.getValue());
            }

            HttpRequest request = requestBuilder.build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                updateStatus(integration, "HTTP " + response.statusCode() + ": " + truncate(response.body()));
            } else {
                clearStatus(integration);
            }

            log.info("Webhook {} dispatched to {}: status={}", integration.getId(), url, response.statusCode());
        } catch (IOException e) {
            log.error("Failed to dispatch webhook {}: {}", integration.getId(), e.getMessage());
            updateStatus(integration, e.getClass().getSimpleName() + ": " + truncate(e.getMessage()));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Webhook {} dispatch interrupted", integration.getId());
            updateStatus(integration, "Interrupted");
        } catch (RuntimeException e) {
            log.error("Unexpected error dispatching webhook {}: {}", integration.getId(), e.getMessage(), e);
            updateStatus(integration, e.getClass().getSimpleName() + ": " + truncate(e.getMessage()));
        }
    }

    private void updateStatus(Integration integration, String error) {
        integration.setLastError(error);
        repository.save(integration);
    }

    private void clearStatus(Integration integration) {
        if (integration.getLastError() != null) {
            integration.setLastError(null);
            repository.save(integration);
        }
    }

    private static String truncate(String s) {
        if (s == null) return null;
        return s.length() > 200 ? s.substring(0, 200) + "..." : s;
    }

    @SuppressWarnings("unchecked")
    private Map<String, String> resolveHeaders(Map<String, Object> config) {
        Object headersObj = config.get("headers");
        if (headersObj instanceof Map) {
            Map<String, String> result = new HashMap<>();
            ((Map<String, Object>) headersObj).forEach((k, v) -> result.put(k, String.valueOf(v)));
            return result;
        }
        return Map.of("Content-Type", "application/json");
    }

    private Map<String, String> buildContext(DomainEvent event) {
        Map<String, String> ctx = new HashMap<>();
        ctx.put("action", nullToEmpty(event.action()));
        ctx.put("resourceType", nullToEmpty(event.resourceType()));
        ctx.put("resourceId", event.resourceId() != null ? String.valueOf(event.resourceId()) : "");
        ctx.put("resourceName", nullToEmpty(event.resourceName()));
        ctx.put("details", nullToEmpty(event.details()));
        ctx.put("projectId", event.projectId() != null ? String.valueOf(event.projectId()) : "");
        ctx.put("user.id", event.userId() != null ? String.valueOf(event.userId()) : "");
        ctx.put("user.name", nullToEmpty(event.userName()));
        ctx.put("user.email", nullToEmpty(event.userEmail()));
        ctx.put("timestamp", Instant.now().toString());
        return ctx;
    }

    private Map<String, Object> parseConfig(String configJson) {
        if (configJson == null || configJson.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(configJson, new TypeReference<Map<String, Object>>() {});
        } catch (IOException e) {
            log.warn("Failed to parse integration config JSON: {}", configJson, e);
            return Map.of();
        }
    }

    private static String nullToEmpty(String s) {
        return s != null ? s : "";
    }

    private static boolean isPublicHost(String host) {
        if (host == null) return false;
        try {
            InetAddress addr = InetAddress.getByName(host);
            if (addr.isLoopbackAddress() || addr.isLinkLocalAddress() || addr.isSiteLocalAddress()) {
                return false;
            }
            return true;
        } catch (UnknownHostException e) {
            return false;
        }
    }
}
