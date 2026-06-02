package ru.mozhno.auth;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

public class UserAuthentication extends AbstractAuthenticationToken {
    private final Integer userId;
    private final String email;
    private final String role;

    public UserAuthentication(Integer userId, String email, String role) {
        super(buildAuthorities(role));
        this.userId = userId;
        this.email = email;
        this.role = role;
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
        return email;
    }

    public Integer getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}