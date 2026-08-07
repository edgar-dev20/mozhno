package dev.mozhno.mail;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.smtp")
public class MozhnoSmtpProperties {

    private String host;
    private int port = 587;
    private String username;
    private String password;
    private boolean ssl;
    private boolean starttls = true;
}
