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

    @InjectMocks
    private AuthService authService;

    @Test
    void login_shouldReturnTokenAndUserOnValidCredentials() {
        User user = new User();
        user.setId(1);
        user.setEmail("user@example.com");
        user.setPasswordHash("$2a$12$hashedpassword");
        user.setRole("admin");

        when(userRepository.findByEmail("user@example.com")).thenReturn(user);
        when(passwordEncoder.matches("correctpassword", user.getPasswordHash())).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("jwt.token.here");

        LoginResponse response = authService.login("user@example.com", "correctpassword");

        assertNotNull(response);
        assertEquals("jwt.token.here", response.token());
        assertEquals("user@example.com", response.user().email());
        assertEquals("admin", response.user().role());
    }

    @Test
    void login_shouldThrowOnInvalidEmail() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(null);

        assertThrows(AuthService.InvalidCredentialsException.class,
            () -> authService.login("nonexistent@example.com", "password"));
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
            () -> authService.login("user@example.com", "wrongpassword"));
    }

    @Test
    void getCurrentUser_shouldReturnUserDto() {
        User user = new User();
        user.setId(1);
        user.setEmail("user@example.com");
        user.setRole("viewer");

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
}