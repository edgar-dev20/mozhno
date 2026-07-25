package dev.mozhno.auth;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
 * of at least 256 bits (32 bytes). If left empty a random key is generated on startup,
 * which invalidates all existing tokens after every restart.</p>
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

    @PostConstruct
    void validate() {
        if (secret == null || secret.isBlank()) {
            byte[] randomBytes = new byte[32];
            new SecureRandom().nextBytes(randomBytes);
            secret = Base64.getEncoder().encodeToString(randomBytes);
            log.warn(
                "MOZHNO_JWT_SECRET is not set — generated a random key for this session. "
                + "All tokens will be invalidated on restart. "
                + "Set MOZHNO_JWT_SECRET to a persistent key for production use.");
        }
        byte[] decoded = Base64.getDecoder().decode(secret);
        if (decoded.length < 32) {
            throw new IllegalStateException(
                "MOZHNO_JWT_SECRET must be at least 256 bits (32 bytes) when Base64-decoded. "
                + "Actual length: " + decoded.length + " bytes. "
                + "Generate a secure key: openssl rand -base64 32");
        }
    }
}
