package dev.mozhno.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security {@code Authentication} token representing a client authenticated via API key.
 *
 * <p>Carries the API key value, project id, key name, and environment id.
 * Always granted the {@code ROLE_CLIENT} authority.</p>
 */
public class ApiKeyAuthentication extends AbstractAuthenticationToken {
    private final String apiKey;
    private final Integer projectId;
    private final String keyName;
    private final Integer environmentId;
    private final String keyType;

    public ApiKeyAuthentication(String apiKey, Integer projectId, String keyName, Integer environmentId, String keyType) {
        super("FRONTEND".equals(keyType)
            ? List.of(new SimpleGrantedAuthority("ROLE_CLIENT"), new SimpleGrantedAuthority("ROLE_FRONTEND"))
            : List.of(new SimpleGrantedAuthority("ROLE_CLIENT"), new SimpleGrantedAuthority("ROLE_SERVER")));
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.keyName = keyName;
        this.environmentId = environmentId;
        this.keyType = keyType;
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

    public String getKeyType() {
        return keyType;
    }
}