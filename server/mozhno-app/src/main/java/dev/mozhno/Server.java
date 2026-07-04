package dev.mozhno;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;

import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point for the Mozhno Feature Flags server.
 * Bootstraps the Spring Boot application with scheduling enabled
 * and scans {@code dev.mozhno} for {@code @ConfigurationProperties} beans.
 */
@SpringBootApplication
@ConfigurationPropertiesScan("dev.mozhno")
@EnableCaching
@EnableScheduling
public class Server {
    public static void main(String[] args) {
        SpringApplication.run(Server.class, args);
    }
}