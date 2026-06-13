package dev.mozhno;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import dev.mozhno.audit.AuditProperties;
import dev.mozhno.auth.JwtProperties;
import dev.mozhno.security.RateLimitProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, AuditProperties.class, RateLimitProperties.class})
@EnableScheduling
public class TestApplication {
}
