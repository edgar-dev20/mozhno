package ru.mozhno.spi.impl;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import ru.mozhno.auth.JwtService;
import ru.mozhno.auth.JwtToken;
import ru.mozhno.auth.UserAuthentication;
import ru.mozhno.spi.AuthenticationProviderSpi;

import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class JwtAuthenticationProvider implements AuthenticationProviderSpi {

    private final JwtService jwtService;

    public JwtAuthenticationProvider(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public int priority() {
        return 100;
    }

    @Override
    public boolean supports(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return header != null && header.startsWith("Bearer ");
    }

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
            jwtToken.getStatus()
        );
        return Optional.of(auth);
    }
}
