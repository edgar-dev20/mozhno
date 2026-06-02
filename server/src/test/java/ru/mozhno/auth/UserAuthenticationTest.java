package ru.mozhno.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import static org.junit.jupiter.api.Assertions.*;

class UserAuthenticationTest {

    @Test
    void shouldContainRoleUserAndSpecificRole() {
        UserAuthentication auth = new UserAuthentication(1, "test@example.com", "admin");

        assertTrue(auth.isAuthenticated());
        assertEquals("test@example.com", auth.getPrincipal());
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
        UserAuthentication auth = new UserAuthentication(2, "viewer@example.com", "viewer");

        assertEquals("viewer", auth.getRole());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_VIEWER")));
    }

    @Test
    void shouldHandleEditorRole() {
        UserAuthentication auth = new UserAuthentication(3, "editor@example.com", "editor");

        assertEquals("editor", auth.getRole());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_EDITOR")));
    }
}