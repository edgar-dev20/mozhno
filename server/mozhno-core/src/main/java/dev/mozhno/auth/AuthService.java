package dev.mozhno.auth;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.spi.AuthenticationFlowSpi;

import dev.mozhno.exception.NotFoundException;
import dev.mozhno.projects.ProjectRepository;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Handles authentication workflows including login, token refresh, and logout.
 *
 * <p>Login is delegated to registered {@link dev.mozhno.spi.AuthenticationFlowSpi}
 * implementations. The first flow that {@link dev.mozhno.spi.AuthenticationFlowSpi#supports supports}
 * the request is used for authentication. On success, a JWT access token and refresh token
 * pair is issued via {@link RefreshTokenService}.</p>
 */
@Service
public class AuthService {
    private final List<AuthenticationFlowSpi> authFlows;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public AuthService(List<AuthenticationFlowSpi> authFlows,
                       JwtService jwtService, RefreshTokenService refreshTokenService,
                       UserRepository userRepository, ProjectRepository projectRepository) {
        this.authFlows = authFlows.stream()
            .sorted(Comparator.comparingInt(AuthenticationFlowSpi::priority))
            .toList();
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    /**
     * Authenticates with email and password, then issues a token pair.
     *
     * @param email      user email
     * @param password   plaintext password
     * @param rememberMe whether to issue a long-lived refresh token
     * @return login response containing access token, refresh token, and user DTO
     */
    public LoginResponse login(String email, String password, boolean rememberMe) {
        return login(email, password, null, Collections.emptyMap(), rememberMe, null);
    }

    /**
     * Authenticates with email, password, and optional provider parameters, then issues a token pair.
     *
     * @param email      user email
     * @param password   plaintext password
     * @param provider   authentication provider name (e.g. "ldap", "sso"), or null
     * @param params     additional provider-specific parameters
     * @param rememberMe whether to issue a long-lived refresh token
     * @param projectId  project ID from the login request, or null
     * @return login response containing access token, refresh token, and user DTO
     */
    public LoginResponse login(String email, String password, String provider,
                                java.util.Map<String, String> params, boolean rememberMe,
                                Integer projectId) {
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
        Integer resolvedProjectId = projectId != null ? projectId : resolveProjectId();
        RefreshTokenService.TokenPair tokens = refreshTokenService.issueTokens(user, resolvedProjectId, rememberMe);
        return new LoginResponse(tokens.getAccessToken(), tokens.getRefreshToken(), toDto(user));
    }

    public LoginResponse selectProject(String email, Integer projectId) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        RefreshTokenService.TokenPair tokens = refreshTokenService.issueTokens(user, projectId, true);
        return new LoginResponse(tokens.getAccessToken(), tokens.getRefreshToken(), toDto(user));
    }

    private Integer resolveProjectId() {
        int count = projectRepository.count();
        if (count == 1) {
            return projectRepository.findAll().get(0).getId();
        }
        return null;
    }

    /**
     * Exchanges a valid refresh token for a new access/refresh token pair.
     *
     * @param rawRefreshToken the raw refresh token string
     * @param projectId       the project ID from the old JWT, or null
     * @return login response with fresh tokens and current user DTO
     */
    @Transactional
    public LoginResponse refresh(String rawRefreshToken, Integer projectId) {
        RefreshTokenService.TokenPair tokens = refreshTokenService.refresh(rawRefreshToken, projectId);
        String email = jwtService.parseToken(tokens.getAccessToken()).getEmail();
        User user = userRepository.findByEmail(email);
        return new LoginResponse(tokens.getAccessToken(), tokens.getRefreshToken(), toDto(user));
    }

    @Transactional
    public LoginResponse refresh(String rawRefreshToken) {
        return refresh(rawRefreshToken, null);
    }

    /**
     * Revokes the refresh token and its family, effectively logging the user out.
     *
     * @param rawRefreshToken the refresh token to revoke (ignored if null or empty)
     */
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isEmpty()) {
            refreshTokenService.revoke(rawRefreshToken);
        }
    }

    /**
     * Returns the DTO for the currently authenticated user.
     *
     * @param email email address of the authenticated user
     * @return user DTO
     */
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new NotFoundException("User not found");
        }
        return toDto(user);
    }

    private UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getStatus(), user.getAvatar(), user.getLocale(), user.getCreatedAt(), user.getLastActiveAt());
    }

    /**
     * Thrown when authentication fails due to invalid credentials or when no provider
     * is available to handle the request.
     */
    public static class InvalidCredentialsException extends RuntimeException {
        public InvalidCredentialsException(String message) {
            super(message);
        }
    }
}
