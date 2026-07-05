package dev.mozhno.spi.impl;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import dev.mozhno.apikeys.ApiKey;
import dev.mozhno.apikeys.ApiKeyService;
import dev.mozhno.security.ApiKeyAuthentication;
import dev.mozhno.spi.AuthenticationProviderSpi;

import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Default {@link AuthenticationProviderSpi} implementation that authenticates
 * requests using API keys managed via {@link ApiKeyService}.
 *
 * <p>This provider runs at priority {@code 200}, meaning it is tried after the
 * JWT provider (priority {@code 100}). It extracts the token from the
 * {@code Authorization} header, looks up the corresponding API key in the
 * database, and updates the key's last-used timestamp on successful
 * authentication. If the header is missing or the token is not found, the
 * request falls through to the next provider in the chain.
 */
@Component
public class ApiKeyAuthenticationProvider implements AuthenticationProviderSpi {

    private final ApiKeyService apiKeyService;
    private final ConcurrentHashMap<Integer, Long> lastUsedCache = new ConcurrentHashMap<>();
    private static final long LAST_USED_DEBOUNCE_SECONDS = 60;

    public ApiKeyAuthenticationProvider(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    /**
     * Returns the priority of this provider.
     *
     * @return {@code 200} — API key authentication is tried after JWT
     *         ({@code 100}) but before any lower-priority providers
     */
    @Override
    public int priority() {
        return 200;
    }

    /**
     * Determines whether this provider should attempt authentication for the
     * given request.
     *
     * @param request the incoming HTTP request
     * @return {@code true} if the {@code Authorization} header is present,
     *         regardless of its value
     * @implNote The OSS implementation checks only for header presence; token
     *           format validation is deferred to {@link #authenticate}.
     */
    @Override
    public boolean supports(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null) return false;
        String token = header.startsWith("Bearer ") ? header.substring(7) : header;
        return !token.contains(".");
    }

    /**
     * Authenticates the request by extracting and validating an API key from
     * the {@code Authorization} header.
     *
     * @param request the incoming HTTP request containing the API key token
     * @return an {@link Optional} containing an {@link ApiKeyAuthentication}
     *         on success, or {@link Optional#empty()} if the header is missing
     *         or the token is not found in the database
     * @implNote The OSS implementation strips the {@code Bearer } prefix if
     *           present, looks up the token via {@link ApiKeyService}, and
     *           updates the key's last-used timestamp in the database.
     */
    @Override
    public Optional<Authentication> authenticate(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null) {
            return Optional.empty();
        }
        String token = header.startsWith("Bearer ") ? header.substring(7) : header;
        ApiKey apiKey = apiKeyService.findByApiKey(token);
        if (apiKey == null) {
            return Optional.empty();
        }
        long now = System.currentTimeMillis() / 1000;
        Long last = lastUsedCache.get(apiKey.getId());
        if (last == null || now - last >= LAST_USED_DEBOUNCE_SECONDS) {
            lastUsedCache.put(apiKey.getId(), now);
            apiKeyService.updateLastUsed(apiKey.getId());
        }
        ApiKeyAuthentication auth = new ApiKeyAuthentication(
            apiKey.getApiKey(),
            apiKey.getProjectId(),
            apiKey.getName(),
            apiKey.getEnvironmentId(),
            apiKey.getKeyType() != null ? apiKey.getKeyType() : "SERVER"
        );
        return Optional.of(auth);
    }
}
