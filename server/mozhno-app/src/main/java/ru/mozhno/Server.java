package ru.mozhno;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import ru.mozhno.audit.AuditProperties;
import ru.mozhno.auth.JwtProperties;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, AuditProperties.class})
@EnableScheduling
public class Server {
    public static void main(String[] args) {
        SpringApplication.run(Server.class, args);
    }
}