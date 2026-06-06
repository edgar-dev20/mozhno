package ru.mozhno.spi.impl;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import ru.mozhno.apikeys.ApiKey;
import ru.mozhno.apikeys.ApiKeyService;
import ru.mozhno.security.ApiKeyAuthentication;
import ru.mozhno.spi.AuthenticationProviderSpi;

import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ApiKeyAuthenticationProvider implements AuthenticationProviderSpi {

    private final ApiKeyService apiKeyService;

    public ApiKeyAuthenticationProvider(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @Override
    public int priority() {
        return 200;
    }

    @Override
    public boolean supports(HttpServletRequest request) {
        return request.getHeader("Authorization") != null;
    }

    @Override
    public Optional<Authentication> authenticate(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null) {
            return Optional.empty();
        }
        String token = header.startsWith("Bearer ") ? header.substring(7) : header;
        ApiKey apiKey = apiKeyService.findByApiKey(token);
        if (apiKey == null) {
            return Optional.empty();
        }
        apiKeyService.updateLastUsed(apiKey.getId());
        ApiKeyAuthentication auth = new ApiKeyAuthentication(
            apiKey.getApiKey(),
            apiKey.getProjectId(),
            apiKey.getName(),
            apiKey.getEnvironmentId()
        );
        return Optional.of(auth);
    }
}
