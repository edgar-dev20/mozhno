package dev.mozhno;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import dev.mozhno.audit.AuditProperties;
import dev.mozhno.auth.JwtProperties;
import dev.mozhno.security.RateLimitProperties;

import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point for the Mozhno Feature Flags server.
 * Bootstraps the Spring Boot application with scheduling enabled
 * and custom configuration properties for JWT and audit logging.
 */
@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, AuditProperties.class, RateLimitProperties.class})
@EnableCaching
@EnableScheduling
public class Server {
    public static void main(String[] args) {
        SpringApplication.run(Server.class, args);
    }
}