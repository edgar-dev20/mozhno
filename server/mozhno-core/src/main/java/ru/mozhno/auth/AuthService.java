package ru.mozhno.auth;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.spi.AuthenticationFlowSpi;

import java.util.Collections;
import java.util.List;

@Service
public class AuthService {
    private final List<AuthenticationFlowSpi> authFlows;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    public AuthService(List<AuthenticationFlowSpi> authFlows,
                       JwtService jwtService, RefreshTokenService refreshTokenService,
                       UserRepository userRepository) {
        this.authFlows = authFlows;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
    }

    public LoginResponse login(String email, String password, boolean rememberMe) {
        return login(email, password, null, Collections.emptyMap(), rememberMe);
    }

    public LoginResponse login(String email, String password, String provider,
                                java.util.Map<String, String> params, boolean rememberMe) {
        AuthenticationFlowSpi.AuthRequest request = new AuthenticationFlowSpi.AuthRequest(
            email, password, provider, params);

        AuthenticationFlowSpi.AuthResult result = null;

        for (AuthenticationFlowSpi flow : authFlows) {
            if (flow.supports(request)) {
                result = flow.authenticate(request);
                if (result.success()) {
                    break;
                }
            }
        }

        if (result == null || !result.success()) {
            throw new InvalidCredentialsException(
                result != null ? result.errorMessage() : "No authentication provider available");
        }

        User user = userRepository.findById(result.userId());
        RefreshTokenService.TokenPair tokens = refreshTokenService.issueTokens(user, rememberMe);
        return new LoginResponse(tokens.getAccessToken(), tokens.getRefreshToken(), toDto(user));
    }

    @Transactional
    public LoginResponse refresh(String rawRefreshToken) {
        RefreshTokenService.TokenPair tokens = refreshTokenService.refresh(rawRefreshToken);
        String email = jwtService.parseToken(tokens.getAccessToken()).getEmail();
        User user = userRepository.findByEmail(email);
        return new LoginResponse(tokens.getAccessToken(), tokens.getRefreshToken(), toDto(user));
    }

    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isEmpty()) {
            refreshTokenService.revoke(rawRefreshToken);
        }
    }

    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return toDto(user);
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getStatus(), user.getCreatedAt(), user.getLastActiveAt());
    }

    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) {
            super(message);
        }
    }
}
