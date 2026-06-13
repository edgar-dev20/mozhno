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
import java.util.Map;

import static dev.mozhno.client.HashUtils.generateRawToken;
import static dev.mozhno.client.HashUtils.sha256;

@Service
public class PasswordResetService {
    private static final int TOKEN_TTL_HOURS = 1;
    private static final int RESET_COOLDOWN_MINUTES = 5;

    private static final Map<String, String> RU_RESET_SUBJECT = Map.of("ru", "Сброс пароля Mozhno", "en", "Mozhno password reset");
    private static final Map<String, String> RU_ADMIN_RESET_SUBJECT = Map.of("ru", "Сброс пароля Mozhno", "en", "Mozhno password reset");

    private final Map<String, Instant> lastResetSent = new java.util.concurrent.ConcurrentHashMap<>();

    private boolean isInCooldown(String email) {
        Instant lastSent = lastResetSent.get(email);
        if (lastSent == null) return false;
        if (lastSent.plus(RESET_COOLDOWN_MINUTES, ChronoUnit.MINUTES).isAfter(Instant.now())) {
            return true;
        }
        lastResetSent.remove(email);
        return false;
    }

    private void cleanupCooldowns() {
        Instant cutoff = Instant.now().minus(RESET_COOLDOWN_MINUTES + 1, ChronoUnit.MINUTES);
        lastResetSent.entrySet().removeIf(e -> e.getValue().isBefore(cutoff));
    }

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

    public boolean sendResetEmail(String email, String locale) {
        String effectiveLocale = locale != null ? locale : "ru";

        User user = userRepository.findByEmail(email);
        if (user == null || "suspended".equals(user.getStatus()) || "invited".equals(user.getStatus())) {
            return false;
        }

        if (isInCooldown(email)) {
            return false;
        }
        cleanupCooldowns();
        lastResetSent.put(email, Instant.now());

        tokenRepository.markAllUsedForUser(user.getId());

        String rawToken = generateRawToken();
        String tokenHash = sha256(rawToken);

        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(user.getId());
        token.setTokenHash(tokenHash);
        token.setExpiresAt(Instant.now().plus(TOKEN_TTL_HOURS, ChronoUnit.HOURS));
        tokenRepository.save(token);

        String resetLink = baseUrl + "/reset-password?token=" + rawToken;
        String html = emailTemplateService.renderResetPasswordEmail(resetLink, effectiveLocale);
        String subject = RU_RESET_SUBJECT.getOrDefault(effectiveLocale, "Mozhno password reset");

        notificationSpi.send(new NotificationSpi.NotificationEvent(
            "EMAIL", email, subject, html, null));

        events.publish(DomainEvent.of(null, "password_reset.requested", "user",
            user.getId(), user.getEmail(), "Password reset email sent"));
        return true;
    }

    public void sendAdminResetEmail(Integer userId) {
        User user = userRepository.findById(userId);
        if (user == null || "suspended".equals(user.getStatus())) {
            throw new dev.mozhno.exception.NotFoundException("User", userId);
        }

        String locale = user.getLocale() != null ? user.getLocale() : "ru";

        tokenRepository.markAllUsedForUser(userId);

        String rawToken = generateRawToken();
        String tokenHash = sha256(rawToken);

        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(userId);
        token.setTokenHash(tokenHash);
        token.setExpiresAt(Instant.now().plus(TOKEN_TTL_HOURS, ChronoUnit.HOURS));
        tokenRepository.save(token);

        String resetLink = baseUrl + "/reset-password?token=" + rawToken;
        String html = emailTemplateService.renderAdminResetPasswordEmail(resetLink, locale);
        String subject = RU_ADMIN_RESET_SUBJECT.getOrDefault(locale, "Mozhno password reset");

        notificationSpi.send(new NotificationSpi.NotificationEvent(
            "EMAIL", user.getEmail(), subject, html, null));

        events.publish(DomainEvent.of(null, "password_reset.admin_requested", "user",
            userId, user.getEmail(), "Admin requested password reset"));
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