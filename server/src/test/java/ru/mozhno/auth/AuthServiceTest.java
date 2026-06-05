package ru.mozhno.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

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

    @InjectMocks
    private AuthService authService;

    @Test
    void login_shouldReturnTokenAndUserOnValidCredentials() {
        User user = new User();
        user.setId(1);
        user.setEmail("user@example.com");
        user.setPasswordHash("$2a$12$hashedpassword");
        user.setRole("admin");

        RefreshTokenService.TokenPair tokens = new RefreshTokenService.TokenPair("access.token", "refresh.token");

        when(userRepository.findByEmail("user@example.com")).thenReturn(user);
        when(passwordEncoder.matches("correctpassword", user.getPasswordHash())).thenReturn(true);
        when(refreshTokenService.issueTokens(user, false)).thenReturn(tokens);

        LoginResponse response = authService.login("user@example.com", "correctpassword", false);

        assertNotNull(response);
        assertEquals("access.token", response.token());
        assertEquals("refresh.token", response.refreshToken());
        assertEquals("user@example.com", response.user().email());
        assertEquals("admin", response.user().role());
    }

    @Test
    void login_shouldThrowOnInvalidEmail() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(null);

        assertThrows(AuthService.InvalidCredentialsException.class,
            () -> authService.login("nonexistent@example.com", "password", false));
    }

    @Test
    void login_shouldThrowOnInvalidPassword() {
        User user = new User();
        user.setId(1);
        user.setEmail("user@example.com");
        user.setPasswordHash("$2a$12$hashedpassword");

        when(userRepository.findByEmail("user@example.com")).thenReturn(user);
        when(passwordEncoder.matches("wrongpassword", user.getPasswordHash())).thenReturn(false);

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
        user.setPasswordHash("$2a$12$hash");
        user.setRole("developer");
        user.setStatus("active");

        RefreshTokenService.TokenPair tokens = new RefreshTokenService.TokenPair("acc.tok", "ref.tok");

        when(userRepository.findByEmail("remember@example.com")).thenReturn(user);
        when(passwordEncoder.matches("pass", user.getPasswordHash())).thenReturn(true);
        when(refreshTokenService.issueTokens(user, true)).thenReturn(tokens);

        LoginResponse response = authService.login("remember@example.com", "pass", true);

        assertEquals("acc.tok", response.token());
        assertEquals("ref.tok", response.refreshToken());
        verify(refreshTokenService).issueTokens(user, true);
    }

    @Test
    void refresh_shouldReturnNewTokens() {
        User user = new User();
        user.setId(3);
        user.setEmail("refresh@example.com");
        user.setName("Refresh User");
        user.setRole("editor");

        RefreshTokenService.TokenPair newTokens = new RefreshTokenService.TokenPair("new.acc", "new.ref");

        when(refreshTokenService.refresh("valid.old.token")).thenReturn(newTokens);
        when(jwtService.parseToken("new.acc")).thenReturn(
            new JwtToken(3, "refresh@example.com", "Refresh User", "editor", "active"));
        when(userRepository.findByEmail("refresh@example.com")).thenReturn(user);

        LoginResponse response = authService.refresh("valid.old.token");

        assertNotNull(response);
        assertEquals("new.acc", response.token());
        assertEquals("new.ref", response.refreshToken());
        assertEquals("refresh@example.com", response.user().email());
    }

    @Test
    void refresh_shouldPropagateTokenReuseException() {
        when(refreshTokenService.refresh("stolen.token")).thenThrow(
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
        User suspended = new User();
        suspended.setId(4);
        suspended.setEmail("suspended@example.com");
        suspended.setPasswordHash("hash");
        suspended.setStatus("suspended");

        when(userRepository.findByEmail("suspended@example.com")).thenReturn(suspended);

        AuthService.InvalidCredentialsException ex = assertThrows(
            AuthService.InvalidCredentialsException.class,
            () -> authService.login("suspended@example.com", "pass", false));

        assertEquals("Account is suspended", ex.getMessage());
    }
}