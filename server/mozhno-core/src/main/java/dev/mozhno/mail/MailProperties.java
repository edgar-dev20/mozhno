package dev.mozhno.mail;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for outbound email.
 * Bound to the {@code mozhno.mail} prefix. SMTP transport settings live under
 * the standard {@code spring.mail.*} keys.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.mail")
public class MailProperties {

    /** Sender address used in the "From" header of outbound emails. */
    @NotBlank
    private String from = "noreply@mozhno.dev";
}
