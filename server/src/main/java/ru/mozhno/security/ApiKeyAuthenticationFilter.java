package ru.mozhno.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import ru.mozhno.apikeys.ApiKey;
import ru.mozhno.apikeys.ApiKeyService;

import java.io.IOException;

public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {
    private final ApiKeyService apiKeyService;

    public ApiKeyAuthenticationFilter(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null) {
            String token = header.startsWith("Bearer ") ? header.substring(7) : header;
            ApiKey apiKey = apiKeyService.findByApiKey(token);
            if (apiKey != null) {
                apiKeyService.updateLastUsed(apiKey.getId());
                ApiKeyAuthentication auth = new ApiKeyAuthentication(
                    apiKey.getApiKey(),
                    apiKey.getProjectId(),
                    apiKey.getName(),
                    apiKey.getEnvironmentId()
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }
}