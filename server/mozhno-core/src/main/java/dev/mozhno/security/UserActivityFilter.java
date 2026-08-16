package dev.mozhno.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import dev.mozhno.auth.AuthProperties;
import dev.mozhno.auth.UserAuthentication;
import dev.mozhno.auth.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;

/**
 * Touches the authenticated user's last-activity timestamp on requests
 * carrying a valid JWT. API-key authenticated client requests
 * ({@link ApiKeyAuthentication}) are intentionally ignored — they represent
 * SDK instances, not users.
 *
 * <p>A per-user in-memory gate skips the database entirely within the
 * activity window, so at most one {@code UPDATE} per user per window is
 * issued. The throttled SQL in {@link UserRepository#touchActivity} remains
 * as the cluster-safe backstop for concurrent or multi-instance requests.
 */
public class UserActivityFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final Duration window;
    private final Cache<Integer, Instant> lastTouch;

    public UserActivityFilter(UserRepository userRepository, AuthProperties authProperties) {
        this.userRepository = userRepository;
        this.window = Duration.ofMinutes(authProperties.getActivityWindowMinutes());
        Duration expiry = window.multipliedBy(2).compareTo(Duration.ofMinutes(10)) > 0
            ? window.multipliedBy(2)
            : Duration.ofMinutes(10);
        this.lastTouch = Caffeine.newBuilder()
            .expireAfterWrite(expiry)
            .maximumSize(100_000)
            .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UserAuthentication userAuth) {
            touchActivity(userAuth.getUserId());
        }
        filterChain.doFilter(request, response);
    }

    private void touchActivity(Integer userId) {
        Instant now = Instant.now();
        Instant last = lastTouch.getIfPresent(userId);
        if (last != null && !last.isBefore(now.minus(window))) {
            return;
        }
        lastTouch.put(userId, now);
        userRepository.touchActivity(userId);
    }
}
