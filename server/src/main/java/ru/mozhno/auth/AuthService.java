package ru.mozhno.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public LoginResponse login(String email, String password, boolean rememberMe) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        if ("suspended".equals(user.getStatus())) {
            throw new InvalidCredentialsException("Account is suspended");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        userRepository.updateLastActive(user.getId());
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