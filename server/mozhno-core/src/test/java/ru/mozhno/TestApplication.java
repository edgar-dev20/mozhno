package ru.mozhno;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import ru.mozhno.audit.AuditProperties;
import ru.mozhno.auth.JwtProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, AuditProperties.class})
@EnableScheduling
public class TestApplication {
}
