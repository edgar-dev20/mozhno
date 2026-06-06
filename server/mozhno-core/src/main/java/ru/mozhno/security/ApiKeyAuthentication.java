package ru.mozhno.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

public class ApiKeyAuthentication extends AbstractAuthenticationToken {
    private final String apiKey;
    private final Integer projectId;
    private final String keyName;
    private final Integer environmentId;

    public ApiKeyAuthentication(String apiKey, Integer projectId, String keyName, Integer environmentId) {
        super(List.of(new SimpleGrantedAuthority("ROLE_CLIENT")));
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.keyName = keyName;
        this.environmentId = environmentId;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return apiKey;
    }

    @Override
    public Object getPrincipal() {
        return keyName;
    }

    public Integer getProjectId() {
        return projectId;
    }

    public Integer getEnvironmentId() {
        return environmentId;
    }

    public String getApiKey() {
        return apiKey;
    }
}