package dev.mozhno.security;

import org.springframework.boot.actuate.autoconfigure.web.ManagementContextConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@ManagementContextConfiguration
public class ManagementSecurityConfig {

    @Bean
    @Order(-10)
    public SecurityFilterChain managementFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/**")
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().denyAll()
            )
            .csrf(AbstractHttpConfigurer::disable);
        return http.build();
    }
}
