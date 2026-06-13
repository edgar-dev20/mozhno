package dev.mozhno.spi.impl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import dev.mozhno.spi.AuthenticationProviderSpi;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;

/**
 * A Spring Security {@link OncePerRequestFilter} that delegates authentication
 * to all registered {@link AuthenticationProviderSpi} implementations.
 *
 * <p>Providers are sorted by {@link AuthenticationProviderSpi#priority() priority}
 * and tried in order on every request. The first provider that both
 * {@link AuthenticationProviderSpi#supports supports} the request and returns a
 * successful authentication sets the {@link SecurityContextHolder SecurityContext}.
 * Subsequent providers are skipped. If no provider authenticates the request,
 * the filter chain continues unauthenticated.
 */
public class DelegatingAuthenticationFilter extends OncePerRequestFilter {

    private final List<AuthenticationProviderSpi> providers;

    public DelegatingAuthenticationFilter(List<AuthenticationProviderSpi> providers) {
        this.providers = providers.stream()
            .sorted(Comparator.comparingInt(AuthenticationProviderSpi::priority))
            .toList();
    }

    /**
     * Iterates through all registered authentication providers in priority order
     * and sets the {@link SecurityContextHolder} on the first successful match.
     *
     * @param request    the incoming HTTP request
     * @param response   the HTTP response
     * @param filterChain the filter chain to continue after authentication
     * @throws ServletException if an error occurs during filtering
     * @throws IOException      if an I/O error occurs
     * @implNote Providers are sorted by priority (lowest first) at construction
     *           time. Authentication stops at the first provider that returns a
     *           non-empty result.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

        for (AuthenticationProviderSpi provider : providers) {
            if (provider.supports(request)) {
                var auth = provider.authenticate(request);
                if (auth.isPresent()) {
                    SecurityContextHolder.getContext().setAuthentication(auth.get());
                    break;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
