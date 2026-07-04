package dev.mozhno.auth;

import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for authentication token lifetimes.
 * Bound to the {@code mozhno.auth} prefix.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.auth")
public class AuthProperties {

    @NestedConfigurationProperty
    private final PasswordReset passwordReset = new PasswordReset();

    @NestedConfigurationProperty
    private final Invite invite = new Invite();

    @Getter
    @Setter
    public static class PasswordReset {
        /** Lifetime of a password reset token, in hours. */
        @Positive
        private int tokenTtlHours = 1;
        /** Minimum delay between password reset emails to the same address, in minutes. */
        @Positive
        private int cooldownMinutes = 5;
    }

    @Getter
    @Setter
    public static class Invite {
        /** Lifetime of a user invite token, in days. */
        @Positive
        private int tokenTtlDays = 7;
    }
}
