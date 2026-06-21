package dev.mozhno.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import static org.junit.jupiter.api.Assertions.*;

class UserAuthenticationTest {

    @Test
    void shouldContainRoleUserAndSpecificRole() {
        UserAuthentication auth = new UserAuthentication(1, "test@example.com", "Test User", "admin", "active", null);

        assertTrue(auth.isAuthenticated());
        var principal = auth.getPrincipal();
        assertInstanceOf(UserPrincipal.class, principal);
        UserPrincipal up = (UserPrincipal) principal;
        assertEquals("test@example.com", up.getName());
        assertEquals("test@example.com", up.email());
        assertEquals("admin", up.role());
        assertEquals(1, auth.getUserId());
        assertEquals("admin", auth.getRole());
        assertNull(auth.getCredentials());

        var authorities = auth.getAuthorities();
        assertEquals(2, authorities.size());
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    }

    @Test
    void shouldHandleViewerRole() {
        UserAuthentication auth = new UserAuthentication(2, "viewer@example.com", "Viewer", "viewer", "active", null);

        assertEquals("viewer", auth.getRole());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_VIEWER")));
    }

    @Test
    void shouldHandleDeveloperRole() {
        UserAuthentication auth = new UserAuthentication(3, "dev@example.com", "Developer", "developer", "active", null);

        assertEquals("developer", auth.getRole());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DEVELOPER")));
    }

    @Test
    void shouldHandleSuspendedUser() {
        UserAuthentication auth = new UserAuthentication(4, "suspended@example.com", "Suspended", "developer", "suspended", null);

        assertEquals("suspended", auth.getStatus());
    }
}