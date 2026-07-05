package dev.mozhno.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Top-level application configuration properties.
 * Bound to the {@code mozhno} prefix.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno")
public class MozhnoProperties {

    /** Publicly reachable base URL of the server. Used to build links in emails and webhooks. */
    @NotBlank
    private String baseUrl = "http://localhost:8080";
}
