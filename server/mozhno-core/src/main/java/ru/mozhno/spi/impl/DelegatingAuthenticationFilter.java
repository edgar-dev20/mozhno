package ru.mozhno.spi.impl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import ru.mozhno.spi.AuthenticationProviderSpi;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;

public class DelegatingAuthenticationFilter extends OncePerRequestFilter {

    private final List<AuthenticationProviderSpi> providers;

    public DelegatingAuthenticationFilter(List<AuthenticationProviderSpi> providers) {
        this.providers = providers.stream()
            .sorted(Comparator.comparingInt(AuthenticationProviderSpi::priority))
            .toList();
    }

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
