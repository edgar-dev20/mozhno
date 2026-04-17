package dev.mozhno.spi.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import dev.mozhno.auth.User;
import dev.mozhno.auth.UserRepository;
import dev.mozhno.spi.AuthenticationFlowSpi;

/**
 * Default {@link AuthenticationFlowSpi} implementation that authenticates
 * users via email and password stored in the database.
 *
 * <p>This is the community-edition authentication flow. It validates
 * credentials against the {@link UserRepository}, checks the account status,
 * and verifies the password hash using the configured {@link PasswordEncoder}.
 * It handles the {@code "password"} provider or a {@code null} provider in
 * the authentication request. Licensed editions may add alternative flows
 * (SSO, LDAP, etc.) by registering additional {@link AuthenticationFlowSpi}
 * implementations.
 */
@Component
public class PasswordAuthFlow implements AuthenticationFlowSpi {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordAuthFlow(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Determines whether this flow supports the given authentication request.
     *
     * @param request the authentication request containing the provider name
     * @return {@code true} if the provider is {@code null} or equals
     *         {@code "password"}
     * @implNote The OSS implementation handles both the explicit
     *           {@code "password"} provider and a {@code null} provider
     *           (default). Other provider values (e.g. {@code "google"})
     *           are handled by alternative flows registered in licensed editions.
     */
    /**
     * Returns the priority of this flow. Lower numeric values are tried first.
     * Default password flow has priority 100 to allow custom flows to take precedence.
     *
     * @return 100
     */
    @Override
    public int priority() {
        return 100;
    }

    @Override
    public boolean supports(AuthRequest request) {
        return request.provider() == null || "password".equals(request.provider());
    }

    /**
     * Authenticates the user by validating the email and password against the
     * database.
     *
     * @param request the authentication request containing email and password
     * @return an {@link AuthResult} with {@code success=true} and the user's
     *         identity if authentication succeeds, or {@code success=false}
     *         with an error message on failure
     * @implNote The OSS implementation performs these checks in order:
     *           <ol>
     *             <li>Validates that email and password are non-null.</li>
     *             <li>Looks up the user by email via {@link UserRepository}.</li>
     *             <li>Checks whether the account is suspended.</li>
     *             <li>Verifies the password against the stored hash using
     *                 {@link PasswordEncoder#matches}.</li>
     *             <li>Updates the user's last-active timestamp on success.</li>
     *           </ol>
     *           Failed attempts return a generic {@code "Invalid email or password"}
     *           message to avoid user enumeration.
     */
    @Override
    public AuthResult authenticate(AuthRequest request) {
        if (request.email() == null || request.password() == null) {
            return new AuthResult(false, "Email and password are required", null, null, null, null, null);
        }

        User user = userRepository.findByEmail(request.email());
        if (user == null) {
            return new AuthResult(false, "Invalid email or password", null, null, null, null, null);
        }
        if ("suspended".equals(user.getStatus())) {
            return new AuthResult(false, "Account is suspended", null, null, null, null, null);
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            return new AuthResult(false, "Invalid email or password", null, null, null, null, null);
        }

        userRepository.updateLastActive(user.getId());
        return new AuthResult(true, null,
            user.getId(), user.getEmail(), user.getName(),
            user.getRole(), user.getStatus());
    }
}
