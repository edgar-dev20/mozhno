package ru.mozhno.spi.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ru.mozhno.auth.User;
import ru.mozhno.auth.UserRepository;
import ru.mozhno.spi.AuthenticationFlowSpi;

@Component
public class PasswordAuthFlow implements AuthenticationFlowSpi {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordAuthFlow(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public boolean supports(AuthRequest request) {
        return request.provider() == null || "password".equals(request.provider());
    }

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
