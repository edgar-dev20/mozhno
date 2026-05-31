package ru.mozhno.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import ru.mozhno.apikeys.ApiKeyService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final ApiKeyService apiKeyService;

    public SecurityConfig(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "API key required"))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "API key required"))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/api/client/**").hasRole("CLIENT")
                .requestMatchers("/api/v1/**").permitAll()
                .anyRequest().permitAll()
            )
            .addFilterBefore(new ApiKeyAuthenticationFilter(apiKeyService), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}