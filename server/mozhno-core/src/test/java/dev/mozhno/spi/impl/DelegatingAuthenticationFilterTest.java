package dev.mozhno.spi.impl;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.Authentication;
import dev.mozhno.spi.AuthenticationProviderSpi;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class DelegatingAuthenticationFilterTest {
    @Test
    void emptyProviders_shouldNotSetAuth() throws Exception {
        var filter = new DelegatingAuthenticationFilter(List.of());
        var request = new MockHttpServletRequest();
        var response = new org.springframework.mock.web.MockHttpServletResponse();
        var chain = new jakarta.servlet.FilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {}
        };

        filter.doFilterInternal(request, response, chain);
        assertThat(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void matchingProvider_shouldSetAuth() throws Exception {
        var mockAuth = new org.springframework.security.authentication.TestingAuthenticationToken("user", "pass", "ROLE_USER");
        AuthenticationProviderSpi provider = new AuthenticationProviderSpi() {
            @Override public int priority() { return 100; }
            @Override public boolean supports(jakarta.servlet.http.HttpServletRequest r) { return true; }
            @Override public Optional<Authentication> authenticate(jakarta.servlet.http.HttpServletRequest r) { return Optional.of(mockAuth); }
        };

        var filter = new DelegatingAuthenticationFilter(List.of(provider));
        var request = new MockHttpServletRequest();
        var response = new org.springframework.mock.web.MockHttpServletResponse();
        var chain = new jakarta.servlet.FilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {}
        };

        filter.doFilterInternal(request, response, chain);
        assertThat(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()).isEqualTo(mockAuth);

        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @Test
    void nonMatchingProvider_shouldNotSetAuth() throws Exception {
        AuthenticationProviderSpi provider = new AuthenticationProviderSpi() {
            @Override public int priority() { return 100; }
            @Override public boolean supports(jakarta.servlet.http.HttpServletRequest r) { return false; }
            @Override public Optional<Authentication> authenticate(jakarta.servlet.http.HttpServletRequest r) { return Optional.empty(); }
        };

        var filter = new DelegatingAuthenticationFilter(List.of(provider));
        var request = new MockHttpServletRequest();
        var response = new org.springframework.mock.web.MockHttpServletResponse();
        var chain = new jakarta.servlet.FilterChain() {
            @Override
            public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {}
        };

        filter.doFilterInternal(request, response, chain);
        assertThat(org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
