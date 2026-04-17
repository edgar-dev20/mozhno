package dev.mozhno.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ApiKeyAuthenticationTest {
    @Test
    void construction_shouldSetAllFields() {
        var auth = new ApiKeyAuthentication("token123", 42, "my-key", 7, "SERVER");

        assertThat(auth.getCredentials()).isEqualTo("token123");
        assertThat(auth.getPrincipal()).isEqualTo("my-key");
        assertThat(auth.getProjectId()).isEqualTo(42);
        assertThat(auth.getEnvironmentId()).isEqualTo(7);
        assertThat(auth.getKeyType()).isEqualTo("SERVER");
        assertThat(auth.isAuthenticated()).isTrue();
        assertThat(auth.getApiKey()).isEqualTo("token123");
    }

    @Test
    void frontendKey_shouldHaveFrontendRole() {
        var auth = new ApiKeyAuthentication("token", 1, "key", null, "FRONTEND");
        assertThat(auth.getKeyType()).isEqualTo("FRONTEND");
        assertThat(auth.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_FRONTEND"));
    }

    @Test
    void serverKey_shouldHaveServerRole() {
        var auth = new ApiKeyAuthentication("token", 1, "key", null, "SERVER");
        assertThat(auth.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_SERVER"));
    }

    @Test
    void nullKeyType_shouldDefaultToServer() {
        var auth = new ApiKeyAuthentication("token", 1, "key", null, null);
        assertThat(auth.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_SERVER"));
        assertThat(auth.getKeyType()).isNull();
    }
}
