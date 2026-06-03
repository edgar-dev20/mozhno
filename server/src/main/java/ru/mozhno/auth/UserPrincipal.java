package ru.mozhno.auth;

import java.security.Principal;

public record UserPrincipal(
    Integer userId,
    String email,
    String role
) implements Principal {
    @Override
    public String getName() {
        return email;
    }

    public boolean isAdmin() {
        return "admin".equals(role);
    }

    public boolean isDeveloper() {
        return "developer".equals(role);
    }

    public boolean isViewer() {
        return "viewer".equals(role);
    }
}