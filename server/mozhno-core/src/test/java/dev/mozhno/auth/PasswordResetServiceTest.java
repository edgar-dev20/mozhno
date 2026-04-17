package dev.mozhno.auth;

import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.mail.EmailTemplateService;
import dev.mozhno.spi.NotificationSpi;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private EmailTemplateService emailTemplateService;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private NotificationSpi notificationSpi;

    @Mock
    private DomainEventPublisher events;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private static final String BASE_URL = "http://localhost:8080";

    private User createTestUser(Integer id, String status) {
        User user = new User();
        user.setId(id);
        user.setEmail("test" + id + "@example.com");
        user.setRole("editor");
        user.setStatus(status);
        return user;
    }

    @Test
    void sendResetEmail_userFound_shouldStoreTokenAndSendEmail() {
        User user = createTestUser(1, "active");
        when(userRepository.findByEmail("test@example.com")).thenReturn(user);
        when(emailTemplateService.renderResetPasswordEmail(anyString())).thenReturn("<html>reset</html>");
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> {
            PasswordResetToken t = inv.getArgument(0);
            t.setId(1);
            return t;
        });

        passwordResetService.sendResetEmail("test@example.com");

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).markAllUsedForUser(1);
        verify(tokenRepository).save(tokenCaptor.capture());
        PasswordResetToken saved = tokenCaptor.getValue();
        assertThat(saved.getUserId()).isEqualTo(1);
        assertThat(saved.getTokenHash()).isNotEmpty();
        assertThat(saved.getExpiresAt()).isAfter(Instant.now());

        ArgumentCaptor<NotificationSpi.NotificationEvent> eventCaptor =
            ArgumentCaptor.forClass(NotificationSpi.NotificationEvent.class);
        verify(notificationSpi).send(eventCaptor.capture());
        NotificationSpi.NotificationEvent event = eventCaptor.getValue();
        assertThat(event.type()).isEqualTo("EMAIL");
        assertThat(event.recipient()).isEqualTo("test@example.com");
        assertThat(event.subject()).isEqualTo("Сброс пароля Mozhno");
        assertThat(event.body()).isEqualTo("<html>reset</html>");

        verify(events).publish(any(DomainEvent.class));
    }

    @Test
    void sendResetEmail_userNotFound_shouldSilentlyReturn() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(null);

        passwordResetService.sendResetEmail("nobody@example.com");

        verify(tokenRepository, never()).save(any());
        verify(notificationSpi, never()).send(any());
    }

    @Test
    void sendResetEmail_userSuspended_shouldSilentlyReturn() {
        User user = createTestUser(2, "suspended");
        when(userRepository.findByEmail("suspended@example.com")).thenReturn(user);

        passwordResetService.sendResetEmail("suspended@example.com");

        verify(tokenRepository, never()).save(any());
        verify(notificationSpi, never()).send(any());
    }

    @Test
    void resetPassword_invalidToken_shouldThrow() {
        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(null);

        assertThatThrownBy(() -> passwordResetService.resetPassword("bad-token", "newpass1"))
            .isInstanceOf(PasswordResetService.InvalidTokenException.class)
            .hasMessageContaining("Invalid or expired");
    }

    @Test
    void resetPassword_alreadyUsedToken_shouldThrow() {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(1);
        token.setUserId(1);
        token.setUsedAt(Instant.now().minus(1, java.time.temporal.ChronoUnit.HOURS));
        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(token);

        assertThatThrownBy(() -> passwordResetService.resetPassword("used-token", "newpass1"))
            .isInstanceOf(PasswordResetService.InvalidTokenException.class)
            .hasMessageContaining("already been used");
    }

    @Test
    void resetPassword_expiredToken_shouldThrow() {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(1);
        token.setUserId(1);
        token.setExpiresAt(Instant.now().minus(1, java.time.temporal.ChronoUnit.HOURS));
        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(token);

        assertThatThrownBy(() -> passwordResetService.resetPassword("expired-token", "newpass1"))
            .isInstanceOf(PasswordResetService.InvalidTokenException.class)
            .hasMessageContaining("expired");
    }

    @Test
    void resetPassword_userNotFound_shouldThrow() {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(1);
        token.setUserId(999);
        token.setExpiresAt(Instant.now().plus(1, java.time.temporal.ChronoUnit.HOURS));
        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(token);
        when(userRepository.findById(999)).thenReturn(null);

        assertThatThrownBy(() -> passwordResetService.resetPassword("valid-token", "newpass1"))
            .isInstanceOf(PasswordResetService.InvalidTokenException.class)
            .hasMessageContaining("User not found");
    }

    @Test
    void resetPassword_success_shouldUpdatePasswordAndMarkUsed() {
        User user = createTestUser(1, "invited");
        PasswordResetToken token = new PasswordResetToken();
        token.setId(10);
        token.setUserId(1);
        token.setExpiresAt(Instant.now().plus(1, java.time.temporal.ChronoUnit.HOURS));

        when(tokenRepository.findByHashForUpdate(anyString())).thenReturn(token);
        when(userRepository.findById(1)).thenReturn(user);
        when(passwordEncoder.encode("newpassword1")).thenReturn("hashed-password");

        passwordResetService.resetPassword("valid-token", "newpassword1");

        verify(passwordEncoder).encode("newpassword1");
        verify(userRepository).save(user);
        assertThat(user.getPasswordHash()).isEqualTo("hashed-password");
        assertThat(user.getStatus()).isEqualTo("active");

        verify(refreshTokenService).revokeAllForUser(1);
        verify(tokenRepository).markUsed(10);
        verify(events).publish(any(DomainEvent.class));
    }

    @Test
    void sha256_shouldProduceDeterministicHash() {
        String hash1 = dev.mozhno.client.HashUtils.sha256("test-input");
        String hash2 = dev.mozhno.client.HashUtils.sha256("test-input");

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(64);
    }

    @Test
    void sha256_shouldProduceDifferentHashForDifferentInputs() {
        String hash1 = dev.mozhno.client.HashUtils.sha256("input-a");
        String hash2 = dev.mozhno.client.HashUtils.sha256("input-b");

        assertThat(hash1).isNotEqualTo(hash2);
    }
}
