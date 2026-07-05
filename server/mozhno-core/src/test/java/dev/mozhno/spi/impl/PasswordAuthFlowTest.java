package dev.mozhno.spi.impl;

import dev.mozhno.auth.User;
import dev.mozhno.auth.UserRepository;
import dev.mozhno.security.SecurityProperties;
import dev.mozhno.spi.AuthenticationFlowSpi;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PasswordAuthFlowTest {

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private SecurityProperties securityProperties;
    private PasswordAuthFlow flow;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = new BCryptPasswordEncoder(4);
        securityProperties = new SecurityProperties();
        securityProperties.setMaxFailedLoginAttempts(3);
        securityProperties.setLockoutDurationMinutes(15);
        flow = new PasswordAuthFlow(userRepository, passwordEncoder, securityProperties);
    }

    private AuthenticationFlowSpi.AuthRequest req(String email, String password) {
        return new AuthenticationFlowSpi.AuthRequest(email, password, "password", java.util.Map.of());
    }

    @Test
    void unknownUser_stillRunsMatch_andReturnsGenericError() {
        when(userRepository.findByEmail("nope@example.com")).thenReturn(null);

        AuthenticationFlowSpi.AuthResult result = flow.authenticate(req("nope@example.com", "whatever"));

        assertFalse(result.success());
        // must not touch failed-attempt counters for a non-existent account
        verify(userRepository, never()).incrementFailedAttempts(any());
    }

    @Test
    void wrongPassword_belowThreshold_incrementsOnly() {
        User user = activeUser("u@example.com", "correct-horse");
        user.setFailedLoginAttempts(0);
        when(userRepository.findByEmail("u@example.com")).thenReturn(user);

        AuthenticationFlowSpi.AuthResult result = flow.authenticate(req("u@example.com", "wrong"));

        assertFalse(result.success());
        verify(userRepository).incrementFailedAttempts(1);
        verify(userRepository, never()).lockUser(any(), any());
    }

    @Test
    void wrongPassword_reachingThreshold_locksAndResetsCounter() {
        User user = activeUser("u@example.com", "correct-horse");
        user.setId(7);
        user.setFailedLoginAttempts(2); // next failure hits maxFailedLoginAttempts=3
        when(userRepository.findByEmail("u@example.com")).thenReturn(user);

        AuthenticationFlowSpi.AuthResult result = flow.authenticate(req("u@example.com", "wrong"));

        assertFalse(result.success());
        verify(userRepository).incrementFailedAttempts(7);
        verify(userRepository).lockUser(eq(7), any(Instant.class));
        // counter is cleared so the account starts fresh after the lockout expires
        verify(userRepository).resetFailedAttempts(7);
    }

    @Test
    void lockedAccount_isRejected() {
        User user = activeUser("u@example.com", "correct-horse");
        user.setLockedUntil(Instant.now().plus(5, ChronoUnit.MINUTES));
        when(userRepository.findByEmail("u@example.com")).thenReturn(user);

        AuthenticationFlowSpi.AuthResult result = flow.authenticate(req("u@example.com", "correct-horse"));

        assertFalse(result.success());
        verify(userRepository, never()).updateLastActive(any());
    }

    @Test
    void correctPassword_succeeds() {
        User user = activeUser("u@example.com", "correct-horse");
        user.setId(9);
        when(userRepository.findByEmail("u@example.com")).thenReturn(user);

        AuthenticationFlowSpi.AuthResult result = flow.authenticate(req("u@example.com", "correct-horse"));

        assertTrue(result.success());
        verify(userRepository).updateLastActive(9);
    }

    private User activeUser(String email, String rawPassword) {
        User user = new User();
        user.setId(1);
        user.setEmail(email);
        user.setName("Test");
        user.setRole("ADMIN");
        user.setStatus("active");
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return user;
    }
}
