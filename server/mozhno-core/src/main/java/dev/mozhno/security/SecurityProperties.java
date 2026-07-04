package dev.mozhno.security;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Security-related configuration properties.
 * Bound to the {@code mozhno.security} prefix.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.security")
public class SecurityProperties {

    /** BCrypt hashing strength (cost factor). Higher is slower but more secure. */
    @Min(4)
    @Max(31)
    private int bcryptStrength = 12;

    /** Number of consecutive failed logins before an account is temporarily locked. */
    @Min(1)
    private int maxFailedLoginAttempts = 5;

    /** Duration (minutes) an account stays locked after too many failed logins. */
    @Min(1)
    private int lockoutDurationMinutes = 15;

    @NestedConfigurationProperty
    private final Cors cors = new Cors();

    @NestedConfigurationProperty
    private final Headers headers = new Headers();

    @Getter
    @Setter
    public static class Cors {
        /** Comma-separated list of allowed origins. Empty disables cross-origin credentials. */
        private List<String> allowedOrigins = List.of();
        private List<String> allowedMethods = List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS");
        private List<String> allowedHeaders = List.of("Authorization", "Content-Type", "X-Requested-With");
        private List<String> exposedHeaders = List.of("X-Total-Count", "Link");
        @Min(0)
        private long maxAgeSeconds = 3600L;
    }

    @Getter
    @Setter
    public static class Headers {
        /** HTTP Strict-Transport-Security max-age in seconds. */
        @Min(0)
        private long hstsMaxAgeSeconds = 31536000L;
        /** Content-Security-Policy directives. */
        @NotNull
        private String contentSecurityPolicy =
            "default-src 'self'; script-src 'self' 'unsafe-inline'; "
            + "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            + "img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; "
            + "connect-src 'self'";
    }
}
