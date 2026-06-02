package ru.mozhno.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            JwtToken jwtToken = jwtService.parseToken(token);
            if (jwtToken != null) {
                UserAuthentication auth = new UserAuthentication(
                    jwtToken.getUserId(),
                    jwtToken.getEmail(),
                    jwtToken.getRole()
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
                request.setAttribute("userEmail", jwtToken.getEmail());
            }
        }

        filterChain.doFilter(request, response);
    }
}