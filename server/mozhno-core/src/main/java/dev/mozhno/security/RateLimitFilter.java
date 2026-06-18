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
        .maximumSize(10_000)
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
        if (!enabled || !request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        RateLimitConfig config = resolveConfig(path, method);
        if (config == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String identity = path.startsWith("/api/client/")
            ? resolveApiKeyIdentity()
            : resolveClientIp(request);

        Bucket bucket = buckets.get(identity + config.keySuffix,
            k -> Bucket.builder().addLimit(config.limit).build());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(config.retryAfterSeconds));
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"Too many requests. Please try again later.\",\"code\":\"RATE_LIMIT_EXCEEDED\"}");
        }
    }

    private RateLimitConfig resolveConfig(String path, String method) {
        if (path.endsWith("/auth/login") && "POST".equalsIgnoreCase(method)) {
            return new RateLimitConfig(toBandwidth(properties.getLogin()), ":login",
                properties.getLogin().getRefillMinutes() * 60L);
        }
        if (path.endsWith("/auth/forgot-password") && "POST".equalsIgnoreCase(method)) {
            return new RateLimitConfig(toBandwidth(properties.getPasswordReset()), ":forgot",
                properties.getPasswordReset().getRefillMinutes() * 60L);
        }
        if (path.endsWith("/auth/reset-password") && "POST".equalsIgnoreCase(method)) {
            return new RateLimitConfig(toBandwidth(properties.getPasswordReset()), ":reset",
                properties.getPasswordReset().getRefillMinutes() * 60L);
        }
        if (path.endsWith("/auth/refresh") && "POST".equalsIgnoreCase(method)) {
            return new RateLimitConfig(toBandwidth(properties.getRefresh()), ":refresh",
                properties.getRefresh().getRefillMinutes() * 60L);
        }
        if (path.endsWith("/auth/accept-invite") && "POST".equalsIgnoreCase(method)) {
            return new RateLimitConfig(toBandwidth(properties.getPasswordReset()), ":invite",
                properties.getPasswordReset().getRefillMinutes() * 60L);
        }
        if (path.startsWith("/api/client/")) {
            return new RateLimitConfig(toBandwidth(properties.getClient()), ":client",
                properties.getClient().getRefillMinutes() * 60L);
        }
        if (path.startsWith("/api/v1/") && isWriteMethod(method)) {
            return new RateLimitConfig(toBandwidth(properties.getApiWrite()), ":api-write",
                properties.getApiWrite().getRefillMinutes() * 60L);
        }
        return null;
    }

    private boolean isWriteMethod(String method) {
        return "POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)
            || "DELETE".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method);
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
        return dev.mozhno.util.HttpUtils.getClientIp(request);
    }

    private record RateLimitConfig(Bandwidth limit, String keySuffix, long retryAfterSeconds) {}
}
