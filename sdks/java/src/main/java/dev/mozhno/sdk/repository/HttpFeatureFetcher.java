package dev.mozhno.sdk.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.mozhno.sdk.MozhnoConfig;
import dev.mozhno.sdk.model.FeatureFlag;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class HttpFeatureFetcher {
    private static final Logger log = LoggerFactory.getLogger(HttpFeatureFetcher.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private static final int MAX_CONSECUTIVE_FAILURES = 5;
    private static final long CIRCUIT_BREAKER_COOLDOWN_MS = 60_000;

    private final MozhnoConfig config;
    private final HttpClient httpClient;
    private String lastEtag;

    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private final AtomicLong circuitOpenUntil = new AtomicLong(0);

    public HttpFeatureFetcher(MozhnoConfig config) {
        this.config = config;
        var builder = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL);
        if (config.getProxy() != null) {
            builder.proxy(java.net.ProxySelector.of((java.net.InetSocketAddress) config.getProxy().address()));
        }
        this.httpClient = builder.build();
    }

    public FeatureFetcherResult fetchFeatures() {
        if (isCircuitOpen()) {
            log.debug("Circuit breaker open, skipping fetch");
            return new FeatureFetcherResult(null, null, false);
        }

        long[] delays = {1000, 2000, 4000};
        for (int attempt = 0; attempt <= delays.length; attempt++) {
            try {
                var uri = URI.create(normalizeUrl(config.getMozhnoUrl()) + "/api/client/features");
                var requestBuilder = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + config.getApiKey())
                    .header("Accept", "application/json")
                    .header("X-Mozhno-App-Name", config.getAppName())
                    .header("X-Mozhno-Instance-Id", config.getInstanceId())
                    .GET();

                if (lastEtag != null) {
                    requestBuilder.header("If-None-Match", lastEtag);
                }

                var request = requestBuilder.build();
                var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() == 304) {
                    onSuccess();
                    return new FeatureFetcherResult(null, lastEtag, true);
                }

                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    log.warn("Failed to fetch features: HTTP {}", response.statusCode());
                    onFailure();
                    return new FeatureFetcherResult(null, null, false);
                }

                String etag = response.headers().firstValue("ETag").orElse(null);
                if (etag != null) {
                    lastEtag = etag;
                }

                List<FeatureFlag> flags = mapper.readValue(response.body(), new TypeReference<>() {});
                onSuccess();
                return new FeatureFetcherResult(flags, lastEtag, false);
            } catch (Exception e) {
                if (attempt < delays.length) {
                    log.debug("Fetch attempt {}/{} failed, retrying in {}ms", attempt + 1, delays.length + 1, delays[attempt]);
                    try {
                        Thread.sleep(delays[attempt]);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        onFailure();
                        return new FeatureFetcherResult(null, null, false);
                    }
                } else {
                    log.error("Error fetching features after {} attempts", delays.length + 1, e);
                    onFailure();
                    return new FeatureFetcherResult(null, null, false);
                }
            }
        }
        onFailure();
        return new FeatureFetcherResult(null, null, false);
    }

    public MetricsSendResult sendMetrics(Map<String, Long> evaluations) {
        if (isCircuitOpenForMetrics()) {
            return MetricsSendResult.FAILURE;
        }

        try {
            var uri = URI.create(normalizeUrl(config.getMozhnoUrl()) + "/api/client/metrics");
            String body = mapper.writeValueAsString(Map.of("evaluations", evaluations));

            var request = HttpRequest.newBuilder()
                .uri(uri)
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + config.getApiKey())
                .header("Content-Type", "application/json")
                .header("X-Mozhno-App-Name", config.getAppName())
                .header("X-Mozhno-Instance-Id", config.getInstanceId())
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

            var response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            boolean success = response.statusCode() >= 200 && response.statusCode() < 300;
            if (success) {
                onSuccess();
            } else {
                onFailure();
            }
            return success ? MetricsSendResult.SUCCESS : MetricsSendResult.FAILURE;
        } catch (Exception e) {
            log.debug("Error sending metrics", e);
            onFailure();
            return MetricsSendResult.FAILURE;
        }
    }

    private boolean isCircuitOpen() {
        return consecutiveFailures.get() >= MAX_CONSECUTIVE_FAILURES
            && System.currentTimeMillis() < circuitOpenUntil.get();
    }

    private boolean isCircuitOpenForMetrics() {
        return consecutiveFailures.get() >= MAX_CONSECUTIVE_FAILURES * 2
            && System.currentTimeMillis() < circuitOpenUntil.get();
    }

    private void onSuccess() {
        consecutiveFailures.set(0);
    }

    private void onFailure() {
        int failures = consecutiveFailures.incrementAndGet();
        if (failures >= MAX_CONSECUTIVE_FAILURES) {
            long until = System.currentTimeMillis() + CIRCUIT_BREAKER_COOLDOWN_MS;
            circuitOpenUntil.set(until);
            log.warn("Circuit breaker opened after {} consecutive failures, will retry in {}s",
                failures, CIRCUIT_BREAKER_COOLDOWN_MS / 1000);
        }
    }

    private String normalizeUrl(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    public record FeatureFetcherResult(List<FeatureFlag> flags, String etag, boolean notModified) {}
    public enum MetricsSendResult { SUCCESS, FAILURE }
}
