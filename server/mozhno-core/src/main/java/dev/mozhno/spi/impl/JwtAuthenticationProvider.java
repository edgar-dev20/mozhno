package dev.mozhno.spi.impl;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import dev.mozhno.auth.JwtService;
import dev.mozhno.auth.JwtToken;
import dev.mozhno.auth.UserAuthentication;
import dev.mozhno.spi.AuthenticationProviderSpi;

import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Default {@link AuthenticationProviderSpi} implementation that authenticates
 * requests using JSON Web Tokens (JWT) parsed via {@link JwtService}.
 *
 * <p>This provider runs at the highest priority ({@code 100}) and is always
 * tried first in the authentication chain. It expects a {@code Bearer} token
 * in the {@code Authorization} header. On success it produces a
 * {@link UserAuthentication} containing the user's identity, role, and status
 * extracted from the token payload.
 */
@Component
public class JwtAuthenticationProvider implements AuthenticationProviderSpi {

    private final JwtService jwtService;

    public JwtAuthenticationProvider(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Returns the priority of this provider.
     *
     * @return {@code 100} — JWT authentication is tried first, before any
     *         other authentication provider
     */
    @Override
    public int priority() {
        return 100;
    }

    /**
     * Determines whether this provider should process the request based on the
     * presence of a JWT Bearer token.
     *
     * @param request the incoming HTTP request
     * @return {@code true} if the {@code Authorization} header starts with
     *         {@code Bearer }
     * @implNote The OSS implementation requires the header to start with the
     *           literal {@code Bearer } prefix. API key tokens without this
     *           prefix are handled by the lower-priority
     *           {@link ApiKeyAuthenticationProvider}.
     */
    @Override
    public boolean supports(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return header != null && header.startsWith("Bearer ");
    }

    /**
     * Parses the JWT Bearer token from the {@code Authorization} header and
     * creates a {@link UserAuthentication} on success.
     *
     * @param request the incoming HTTP request containing a Bearer token
     * @return an {@link Optional} containing a {@link UserAuthentication} with
     *         the user's identity, role, and status, or {@link Optional#empty()}
     *         if the header is missing, does not start with {@code Bearer },
     *         or the token is invalid or expired
     * @implNote The OSS implementation uses {@link JwtService#parseToken} to
     *           validate the token signature and extract claims. No additional
     *           token introspection (e.g. against an external OAuth2 server)
     *           is performed.
     */
    @Override
    public Optional<Authentication> authenticate(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = header.substring(7);
        JwtToken jwtToken = jwtService.parseToken(token);
        if (jwtToken == null) {
            return Optional.empty();
        }
        UserAuthentication auth = new UserAuthentication(
            jwtToken.getUserId(),
            jwtToken.getEmail(),
            jwtToken.getName(),
            jwtToken.getRole(),
            jwtToken.getStatus(),
            jwtToken.getProjectId()
        );
        return Optional.of(auth);
    }
}
