package dev.mozhno.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

public class RateLimitFilter extends OncePerRequestFilter {

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
        .expireAfterAccess(30, TimeUnit.MINUTES)
        .build();

    private final boolean enabled;
    private final RateLimitProperties properties;

    public RateLimitFilter(boolean enabled, RateLimitProperties properties) {
        this.enabled = enabled;
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        if (!"POST".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        Bandwidth limit = null;
        String keySuffix;
        long retryAfterSeconds;

        if (path.endsWith("/auth/login")) {
            limit = toBandwidth(properties.getLogin());
            keySuffix = ":login";
            retryAfterSeconds = properties.getLogin().getRefillMinutes() * 60L;
        } else if (path.endsWith("/auth/forgot-password")) {
            limit = toBandwidth(properties.getPasswordReset());
            keySuffix = ":forgot";
            retryAfterSeconds = properties.getPasswordReset().getRefillMinutes() * 60L;
        } else if (path.endsWith("/auth/reset-password")) {
            limit = toBandwidth(properties.getPasswordReset());
            keySuffix = ":reset";
            retryAfterSeconds = properties.getPasswordReset().getRefillMinutes() * 60L;
        } else if (path.endsWith("/auth/refresh")) {
            limit = toBandwidth(properties.getRefresh());
            keySuffix = ":refresh";
            retryAfterSeconds = properties.getRefresh().getRefillMinutes() * 60L;
        } else if (path.startsWith("/api/client/")) {
            limit = toBandwidth(properties.getClient());
            keySuffix = ":client";
            retryAfterSeconds = properties.getClient().getRefillMinutes() * 60L;
        } else {
            filterChain.doFilter(request, response);
            return;
        }

        String identity;
        if (path.startsWith("/api/client/")) {
            identity = resolveApiKeyIdentity();
        } else {
            identity = resolveClientIp(request);
        }
        String bucketKey = identity + keySuffix;
        Bandwidth effectiveLimit = limit;
        Bucket bucket = buckets.get(bucketKey, k -> Bucket.builder().addLimit(effectiveLimit).build());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\",\"code\":\"RATE_LIMIT_EXCEEDED\"}");
        }
    }

    private static Bandwidth toBandwidth(RateLimitProperties.Bucket props) {
        return Bandwidth.classic(props.getCapacity(),
            Refill.intervally(props.getRefillTokens(), Duration.ofMinutes(props.getRefillMinutes())));
    }

    private String resolveApiKeyIdentity() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof ApiKeyAuthentication apiKeyAuth) {
            String key = apiKeyAuth.getApiKey();
            if (key != null && key.length() > 8) {
                return "apikey:" + key.substring(0, 8);
            }
            return "apikey:" + apiKeyAuth.getProjectId();
        }
        return "apikey:anonymous";
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
