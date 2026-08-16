package dev.mozhno.spi.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.auth.User;
import dev.mozhno.auth.UserRepository;
import dev.mozhno.security.SecurityProperties;
import dev.mozhno.spi.AuthenticationFlowSpi;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

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
    private final SecurityProperties securityProperties;

    /**
     * Pre-computed bcrypt hash (at the configured cost) used to run a dummy
     * password comparison for unknown accounts. This equalises the response
     * time between existing and non-existing users, closing the timing
     * side-channel that would otherwise allow user enumeration.
     */
    private final String dummyHash;

    public PasswordAuthFlow(UserRepository userRepository, PasswordEncoder passwordEncoder,
                            SecurityProperties securityProperties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityProperties = securityProperties;
        this.dummyHash = passwordEncoder.encode("mozhno-dummy-password");
    }

    @Override
    public int priority() {
        return 100;
    }

    @Override
    public boolean supports(AuthRequest request) {
        return request.provider() == null || "password".equals(request.provider());
    }

    @Override
    @Transactional
    public AuthResult authenticate(AuthRequest request) {
        if (request.email() == null || request.password() == null) {
            return new AuthResult(false, "auth.error.email_password_required", null, null, null, null, null);
        }

        User user = userRepository.findByEmail(request.email());
        if (user == null) {
            // Run a dummy comparison so the response time matches the existing-user path.
            passwordEncoder.matches(request.password(), dummyHash);
            return new AuthResult(false, "auth.error.invalid_credentials", null, null, null, null, null);
        }
        if ("suspended".equals(user.getStatus())) {
            return new AuthResult(false, "auth.error.account_suspended", null, null, null, null, null);
        }
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now())) {
            return new AuthResult(false, "auth.error.account_locked", null, null, null, null, null);
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            userRepository.incrementFailedAttempts(user.getId());
            if (user.getFailedLoginAttempts() + 1 >= securityProperties.getMaxFailedLoginAttempts()) {
                userRepository.lockUser(user.getId(), Instant.now().plus(securityProperties.getLockoutDurationMinutes(), ChronoUnit.MINUTES));
                // Clear the counter so the account starts with a fresh attempt budget
                // once the lockout window expires (avoids instant re-lock).
                userRepository.resetFailedAttempts(user.getId());
                return new AuthResult(false, "auth.error.account_locked", null, null, null, null, null);
            }
            return new AuthResult(false, "auth.error.invalid_credentials", null, null, null, null, null);
        }

        if (user.getFailedLoginAttempts() > 0) {
            userRepository.resetFailedAttempts(user.getId());
        }
        return new AuthResult(true, null,
            user.getId(), user.getEmail(), user.getName(),
            user.getRole(), user.getStatus());
    }
}

