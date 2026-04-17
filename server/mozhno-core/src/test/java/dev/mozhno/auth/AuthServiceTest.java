package dev.mozhno.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import dev.mozhno.spi.AuthenticationFlowSpi;
import dev.mozhno.projects.ProjectRepository;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AuthenticationFlowSpi authFlow;

    @Mock
    private ProjectRepository projectRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        List<AuthenticationFlowSpi> flows = List.of(authFlow);
        authService = new AuthService(flows, jwtService, refreshTokenService, userRepository, projectRepository);
    }

    private void mockLoginSuccess(String email, String password, User user) {
        when(authFlow.supports(any())).thenReturn(true);
        when(authFlow.authenticate(any())).thenReturn(new AuthenticationFlowSpi.AuthResult(
            true, null, user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getStatus()));
    }

    private void mockLoginFailure(String message) {
        when(authFlow.supports(any())).thenReturn(true);
        when(authFlow.authenticate(any())).thenReturn(new AuthenticationFlowSpi.AuthResult(
            false, message, null, null, null, null, null));
    }

    @Test
    void login_shouldReturnTokenAndUserOnValidCredentials() {
        User user = new User();
        user.setId(1);
        user.setEmail("user@example.com");
        user.setRole("admin");
        user.setStatus("active");

        RefreshTokenService.TokenPair tokens = new RefreshTokenService.TokenPair("access.token", "refresh.token");

        mockLoginSuccess("user@example.com", "correctpassword", user);
        when(userRepository.findById(1)).thenReturn(user);
        when(refreshTokenService.issueTokens(eq(user), any(), eq(false))).thenReturn(tokens);

        LoginResponse response = authService.login("user@example.com", "correctpassword", false);

        assertNotNull(response);
        assertEquals("access.token", response.token());
        assertEquals("refresh.token", response.refreshToken());
        assertEquals("user@example.com", response.user().email());
        assertEquals("admin", response.user().role());
    }

    @Test
    void login_shouldThrowOnInvalidEmail() {
        mockLoginFailure("Invalid email or password");

        assertThrows(AuthService.InvalidCredentialsException.class,
            () -> authService.login("nonexistent@example.com", "password", false));
    }

    @Test
    void login_shouldThrowOnInvalidPassword() {
        mockLoginFailure("Invalid email or password");

        assertThrows(AuthService.InvalidCredentialsException.class,
            () -> authService.login("user@example.com", "wrongpassword", false));
    }

    @Test
    void getCurrentUser_shouldReturnUserDto() {
        User user = new User();
        user.setId(1);
        user.setEmail("user@example.com");
        user.setName("Test User");
        user.setRole("viewer");
        user.setStatus("active");

        when(userRepository.findByEmail("user@example.com")).thenReturn(user);

        UserDto dto = authService.getCurrentUser("user@example.com");

        assertNotNull(dto);
        assertEquals(1, dto.id());
        assertEquals("user@example.com", dto.email());
        assertEquals("viewer", dto.role());
    }

    @Test
    void getCurrentUser_shouldThrowWhenNotFound() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(null);

        assertThrows(RuntimeException.class,
            () -> authService.getCurrentUser("nobody@example.com"));
    }

    @Test
    void login_withRememberMe_shouldReturnTokens() {
        User user = new User();
        user.setId(2);
        user.setEmail("remember@example.com");
        user.setRole("developer");
        user.setStatus("active");

        RefreshTokenService.TokenPair tokens = new RefreshTokenService.TokenPair("acc.tok", "ref.tok");

        mockLoginSuccess("remember@example.com", "pass", user);
        when(userRepository.findById(2)).thenReturn(user);
        when(refreshTokenService.issueTokens(eq(user), any(), eq(true))).thenReturn(tokens);

        LoginResponse response = authService.login("remember@example.com", "pass", true);

        assertEquals("acc.tok", response.token());
        assertEquals("ref.tok", response.refreshToken());
        verify(refreshTokenService).issueTokens(eq(user), any(), eq(true));
    }

    @Test
    void refresh_shouldReturnNewTokens() {
        User user = new User();
        user.setId(3);
        user.setEmail("refresh@example.com");
        user.setName("Refresh User");
        user.setRole("editor");

        RefreshTokenService.TokenPair newTokens = new RefreshTokenService.TokenPair("new.acc", "new.ref");

        when(refreshTokenService.refresh(eq("valid.old.token"), any())).thenReturn(newTokens);
        when(jwtService.parseToken("new.acc")).thenReturn(
            new JwtToken(3, "refresh@example.com", "Refresh User", "editor", "active", null));
        when(userRepository.findByEmail("refresh@example.com")).thenReturn(user);

        LoginResponse response = authService.refresh("valid.old.token");

        assertNotNull(response);
        assertEquals("new.acc", response.token());
        assertEquals("new.ref", response.refreshToken());
        assertEquals("refresh@example.com", response.user().email());
    }

    @Test
    void refresh_shouldPropagateTokenReuseException() {
        when(refreshTokenService.refresh(eq("stolen.token"), any())).thenThrow(
            new RefreshTokenService.TokenReuseException("Reuse detected"));

        assertThrows(RefreshTokenService.TokenReuseException.class,
            () -> authService.refresh("stolen.token"));
    }

    @Test
    void logout_shouldRevokeTokenWhenProvided() {
        authService.logout("token.to.revoke");

        verify(refreshTokenService).revoke("token.to.revoke");
    }

    @Test
    void logout_shouldNotThrowWithNullToken() {
        assertDoesNotThrow(() -> authService.logout(null));
        verify(refreshTokenService, never()).revoke(any());
    }

    @Test
    void logout_shouldNotThrowWithEmptyToken() {
        assertDoesNotThrow(() -> authService.logout(""));
        verify(refreshTokenService, never()).revoke(any());
    }

    @Test
    void login_shouldThrowWhenUserSuspended() {
        mockLoginFailure("Account is suspended");

        AuthService.InvalidCredentialsException ex = assertThrows(
            AuthService.InvalidCredentialsException.class,
            () -> authService.login("suspended@example.com", "pass", false));

        assertEquals("Account is suspended", ex.getMessage());
    }
}
