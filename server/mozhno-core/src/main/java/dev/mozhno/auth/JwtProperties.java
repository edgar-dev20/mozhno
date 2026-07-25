package dev.mozhno.auth;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.annotation.PostConstruct;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Configuration properties for JWT token generation and validation.
 *
 * <p>Bound to the {@code mozhno.jwt} prefix in application configuration. Provides the
 * signing secret, issuer claim, and TTL values for access and refresh tokens.</p>
 *
 * <p><b>Production:</b> Set {@code MOZHNO_JWT_SECRET} to a persistent Base64-encoded key
 * of at least 256 bits (32 bytes). The application refuses to start without it.
 * With the {@code dev} profile active (local development), a random key is generated on
 * startup if the variable is left empty.</p>
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.jwt")
public class JwtProperties {

    private static final Logger log = LoggerFactory.getLogger(JwtProperties.class);

    private String secret;
    @NotBlank
    private String issuer = "mozhno";
    @Min(1)
    @Max(1440)
    private long accessTokenTtlMinutes = 15;
    @Positive
    private long refreshTokenTtlDays = 30;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    @PostConstruct
    void validate() {
        if (secret == null || secret.isBlank()) {
            if (!isDevProfile()) {
                throw new IllegalStateException(
                    "MOZHNO_JWT_SECRET environment variable is required and must not be empty. "
                    + "Generate a secure key: openssl rand -base64 32");
            }
            byte[] randomBytes = new byte[32];
            new SecureRandom().nextBytes(randomBytes);
            secret = Base64.getEncoder().encodeToString(randomBytes);
            log.warn(
                "MOZHNO_JWT_SECRET is not set — generated a random key for this dev session. "
                + "All tokens will be invalidated on restart.");
        }
        byte[] decoded = Base64.getDecoder().decode(secret);
        if (decoded.length < 32) {
            throw new IllegalStateException(
                "MOZHNO_JWT_SECRET must be at least 256 bits (32 bytes) when Base64-decoded. "
                + "Actual length: " + decoded.length + " bytes. "
                + "Generate a secure key: openssl rand -base64 32");
        }
    }

    private boolean isDevProfile() {
        return activeProfiles != null && activeProfiles.contains("dev");
    }
}
