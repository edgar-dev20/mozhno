package dev.mozhno.auth;

import java.security.Principal;

/**
 * {@link java.security.Principal} implementation for authenticated users.
 *
 * <p>Exposes the user's id, email, and role. Convenience methods
 * {@link #isAdmin()}, {@link #isDeveloper()}, and {@link #isViewer()} simplify
 * role checks in controller code.</p>
 */
public record UserPrincipal(
    Integer userId,
    String email,
    String role,
    Integer projectId
) implements Principal {
    /**
     * Returns the user's email as the principal name.
     *
     * @return email address
     */
    @Override
    public String getName() {
        return email;
    }

    /**
     * @return {@code true} if the user has the admin role
     */
    public boolean isAdmin() {
        return "admin".equals(role);
    }

    /**
     * @return {@code true} if the user has the developer role
     */
    public boolean isDeveloper() {
        return "developer".equals(role);
    }

    /**
     * @return {@code true} if the user has the viewer role
     */
    public boolean isViewer() {
        return "viewer".equals(role);
    }
}