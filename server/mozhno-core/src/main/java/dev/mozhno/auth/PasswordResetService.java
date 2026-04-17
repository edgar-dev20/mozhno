package dev.mozhno.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.mail.EmailTemplateService;
import dev.mozhno.spi.NotificationSpi;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;

import static dev.mozhno.client.HashUtils.generateRawToken;
import static dev.mozhno.client.HashUtils.sha256;

@Service
public class PasswordResetService {
    private static final int TOKEN_TTL_HOURS = 1;
    private static final int RESET_COOLDOWN_MINUTES = 5;

    private final ConcurrentHashMap<String, Instant> lastResetSent = new ConcurrentHashMap<>();

    private final EmailTemplateService emailTemplateService;
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final NotificationSpi notificationSpi;
    private final DomainEventPublisher events;
    private final String baseUrl;

    public PasswordResetService(EmailTemplateService emailTemplateService,
                                PasswordResetTokenRepository tokenRepository,
                                UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                RefreshTokenService refreshTokenService,
                                NotificationSpi notificationSpi,
                                DomainEventPublisher events,
                                @org.springframework.beans.factory.annotation.Value("${app.base-url:http://localhost:8080}") String baseUrl) {
        this.emailTemplateService = emailTemplateService;
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.notificationSpi = notificationSpi;
        this.events = events;
        this.baseUrl = baseUrl;
    }

    public void sendResetEmail(String email) {
        Instant lastSent = lastResetSent.get(email);
        if (lastSent != null && lastSent.plus(RESET_COOLDOWN_MINUTES, ChronoUnit.MINUTES).isAfter(Instant.now())) {
            return;
        }
        lastResetSent.put(email, Instant.now());

        User user = userRepository.findByEmail(email);
        if (user == null || "suspended".equals(user.getStatus())) {
            return;
        }

        tokenRepository.markAllUsedForUser(user.getId());

        String rawToken = generateRawToken();
        String tokenHash = sha256(rawToken);

        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(user.getId());
        token.setTokenHash(tokenHash);
        token.setExpiresAt(Instant.now().plus(TOKEN_TTL_HOURS, ChronoUnit.HOURS));
        tokenRepository.save(token);

        String resetLink = baseUrl + "/auth/reset-password?token=" + rawToken;
        String html = emailTemplateService.renderResetPasswordEmail(resetLink);

        notificationSpi.send(new NotificationSpi.NotificationEvent(
            "EMAIL", email, "Сброс пароля Mozhno", html, null));

        events.publish(DomainEvent.of(null, "password_reset.requested", "user",
            user.getId(), user.getEmail(), "Password reset email sent"));
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        String tokenHash = sha256(rawToken);
        PasswordResetToken token = tokenRepository.findByHashForUpdate(tokenHash);

        if (token == null) {
            throw new InvalidTokenException("Invalid or expired reset token");
        }
        if (token.getUsedAt() != null) {
            throw new InvalidTokenException("This reset link has already been used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException("Reset link has expired");
        }

        PasswordValidator.validate(newPassword, null);

        User user = userRepository.findById(token.getUserId());
        if (user == null) {
            throw new InvalidTokenException("User not found");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setStatus("active");
        userRepository.save(user);

        refreshTokenService.revokeAllForUser(user.getId());
        tokenRepository.markUsed(token.getId());

        events.publish(DomainEvent.of(null, "password_reset.completed", "user",
            user.getId(), user.getEmail(), "Password reset completed"));
    }

    public static class InvalidTokenException extends RuntimeException {
        public InvalidTokenException(String message) {
            super(message);
        }
    }
}
