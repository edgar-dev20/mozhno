package dev.mozhno.spi;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;

import java.util.Optional;

/**
 * Service Provider Interface for Spring Security authentication providers.
 * <p>
 * In the Open Core architecture, the community edition includes a JDBC-based
 * provider. Licensed editions can register additional providers (e.g. LDAP,
 * OAuth2 proxy, API-key header auth) by implementing this SPI and exposing it
 * as a Spring bean. Providers are sorted by {@link #priority() priority} and
 * tried in order.
 */
public interface AuthenticationProviderSpi {

    /**
     * Returns the priority of this provider. Lower numeric values are tried first.
     *
     * @return the provider priority
     */
    int priority();

    /**
     * Checks whether this provider can process the given HTTP request.
     *
     * @param request the incoming HTTP request
     * @return {@code true} if this provider should attempt authentication
     */
    boolean supports(HttpServletRequest request);

    /**
     * Attempts to authenticate the given request.
     *
     * @param request the incoming HTTP request containing credentials
     * @return an {@link Optional} containing the {@link Authentication} on success,
     *         or {@link Optional#empty()} if the request cannot be authenticated
     */
    Optional<Authentication> authenticate(HttpServletRequest request);
}
