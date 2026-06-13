package dev.mozhno.auth;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security {@code Authentication} token representing an authenticated user.
 *
 * <p>Populated by authentication filters after successful JWT or API key verification.
 * Holds the user's identity (id, email, name, role, status) without the credentials.</p>
 */
public class UserAuthentication extends AbstractAuthenticationToken {
    private final Integer userId;
    private final String email;
    private final String name;
    private final String role;
    private final String status;
    private final Integer projectId;

    public UserAuthentication(Integer userId, String email, String name, String role, String status, Integer projectId) {
        super(buildAuthorities(role));
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.status = status;
        this.projectId = projectId;
        setAuthenticated(true);
    }

    private static Collection<? extends GrantedAuthority> buildAuthorities(String role) {
        return List.of(
            new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()),
            new SimpleGrantedAuthority("ROLE_USER")
        );
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return new UserPrincipal(userId, email, role, projectId);
    }

    public Integer getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
    public Integer getProjectId() { return projectId; }
}