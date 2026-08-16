package dev.mozhno.security;

import dev.mozhno.auth.AuthProperties;
import dev.mozhno.auth.UserAuthentication;
import dev.mozhno.auth.UserRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class UserActivityFilterTest {

    private UserRepository userRepository;
    private UserActivityFilter filter;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        filter = new UserActivityFilter(userRepository, new AuthProperties());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void doFilter() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);
        filter.doFilter(request, response, chain);
    }

    @Test
    void userAuthentication_touchesActivity() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(
            new UserAuthentication(7, "u@test.com", "U", "ADMIN", "active", 1));

        doFilter();

        verify(userRepository).touchActivity(7);
    }

    @Test
    void repeatedRequests_withinWindow_touchOnlyOnce() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(
            new UserAuthentication(7, "u@test.com", "U", "ADMIN", "active", 1));

        doFilter();
        doFilter();

        verify(userRepository, times(1)).touchActivity(7);
    }

    @Test
    void apiKeyAuthentication_neverTouches() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(
            new ApiKeyAuthentication("token", 1, "key", 2, "SERVER"));

        doFilter();

        verify(userRepository, never()).touchActivity(any());
    }

    @Test
    void anonymousRequest_neverTouches() throws Exception {
        doFilter();

        verify(userRepository, never()).touchActivity(any());
    }
}
