package dev.mozhno.spi;

import java.util.Map;

/**
 * Service Provider Interface for the authentication flow.
 * <p>
 * In the Open Core architecture, the community edition provides email/password
 * authentication. Licensed editions can swap in an SPI implementation that
 * delegates to an external IdP (Google, SAML, LDAP, etc.) or adds multi-factor
 * authentication steps.
 * <p>
 * Providers are sorted by {@link #priority() priority} (lower values first)
 * and tried in order until one succeeds.
 */
public interface AuthenticationFlowSpi {

    /**
     * Returns the priority of this flow. Lower numeric values are tried first.
     *
     * @return the flow priority
     */
    int priority();

    /**
     * Checks whether this flow can handle the given authentication request.
     *
     * @param request the authentication request
     * @return {@code true} if this flow should process the request
     */
    boolean supports(AuthRequest request);

    /**
     * Executes the authentication flow and returns the result.
     *
     * @param request the authentication request to process
     * @return the outcome of the authentication attempt
     */
    AuthResult authenticate(AuthRequest request);

    /**
     * An incoming authentication request.
     *
     * @param email    the user's email address
     * @param password the user's password (may be {@code null} for SSO flows)
     * @param provider the authentication provider name (e.g. {@code "google"}, {@code "ldap"})
     * @param params   additional provider-specific parameters
     */
    record AuthRequest(String email, String password, String provider, Map<String, String> params) {}

    /**
     * The outcome of an authentication attempt.
     *
     * @param success      whether authentication succeeded
     * @param errorMessage human-readable error description on failure
     * @param userId       the authenticated user's ID (may be {@code null} on failure)
     * @param userEmail    the authenticated user's email
     * @param userName     the authenticated user's display name
     * @param userRole     the authenticated user's role
     * @param userStatus   the authenticated user's status (e.g. {@code "ACTIVE"}, {@code "DISABLED"})
     */
    record AuthResult(boolean success, String errorMessage,
                      Integer userId, String userEmail, String userName,
                      String userRole, String userStatus) {}
}
