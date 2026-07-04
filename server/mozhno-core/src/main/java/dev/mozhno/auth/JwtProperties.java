package dev.mozhno.auth;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.annotation.PostConstruct;
import java.util.Base64;

/**
 * Configuration properties for JWT token generation and validation.
 *
 * <p>Bound to the {@code mozhno.jwt} prefix in application configuration. Provides the
 * signing secret, issuer claim, and TTL values for access and refresh tokens.</p>
 *
 * <p><b>Security:</b> The {@code MOZHNO_JWT_SECRET} environment variable is required.
 * The secret must be a Base64-encoded string of at least 256 bits (32 bytes).
 * The application will refuse to start if the secret is missing or too short.</p>
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.jwt")
public class JwtProperties {
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
            throw new IllegalStateException(
                "MOZHNO_JWT_SECRET environment variable is required and must not be empty. "
                + "Generate a secure key: openssl rand -base64 32");
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
