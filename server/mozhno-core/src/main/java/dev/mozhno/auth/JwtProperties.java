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
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Configuration properties for JWT token generation and validation.
 *
 * <p>Bound to the {@code mozhno.jwt} prefix in application configuration. Provides the
 * signing secret, issuer claim, and TTL values for access and refresh tokens.</p>
 *
 * <p><b>Production:</b> Set {@code MOZHNO_JWT_SECRET} to a persistent key of at least
 * 32 characters (256 bits). Accepts a plain string (UTF-8) or a Base64-encoded binary.
 * If left empty a random key is generated on startup, which invalidates all existing
 * tokens after every restart.</p>
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.jwt")
public class JwtProperties {

    private static final Logger log = LoggerFactory.getLogger(JwtProperties.class);

    private String secret;
    private byte[] secretBytes;
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
            secretBytes = randomBytes;
            log.warn(
                "MOZHNO_JWT_SECRET is not set — generated a random key for this session. "
                + "All tokens will be invalidated on restart. "
                + "Set MOZHNO_JWT_SECRET to a persistent key (≥32 characters) for production use.");
            return;
        }
        secretBytes = resolveSecretBytes(secret);
        if (secretBytes.length < 32) {
            throw new IllegalStateException(
                "MOZHNO_JWT_SECRET must be at least 256 bits (32 bytes) when decoded. "
                + "Actual length: " + secretBytes.length + " bytes. "
                + "Provide a longer key (≥32 characters or a ≥32-byte Base64 value).");
        }
    }

    /**
     * Returns the decoded signing key bytes, trying Base64 first and falling back to
     * raw UTF-8 bytes so users can provide a plain string or a Base64-encoded binary.
     *
     * <p>Uses a round-trip check: Base64-decodes, re-encodes, and compares against the
     * original (ignoring padding). If they match the input was genuine Base64; otherwise
     * the string is treated as a plain-text passphrase.</p>
     */
    private static byte[] resolveSecretBytes(String raw) {
        try {
            byte[] decoded = Base64.getDecoder().decode(raw);
            if (decoded.length >= 32) {
                String reEncoded = Base64.getEncoder().encodeToString(decoded)
                    .replace("=", "");
                if (reEncoded.equals(raw.replace("=", ""))) {
                    return decoded;
                }
            }
        } catch (IllegalArgumentException ignored) {
            // not valid Base64 — treat as plain text
        }
        return raw.getBytes(StandardCharsets.UTF_8);
    }

    /** The raw key bytes to use for HMAC signing (auto-detected from the configured secret). */
    public byte[] getSecretBytes() {
        if (secretBytes == null) {
            secretBytes = resolveSecretBytes(secret);
        }
        return secretBytes;
    }
}
