package dev.mozhno.logging;

import dev.mozhno.auth.UserAuthentication;
import dev.mozhno.security.ApiKeyAuthentication;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class LoggingMdcFilterTest {

    private LoggingMdcFilter filter;

    @BeforeEach
    void setUp() {
        filter = new LoggingMdcFilter();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void cleanup() {
        MDC.clear();
        SecurityContextHolder.clearContext();
    }

    private static class MdcCapturingFilterChain implements FilterChain {
        final Map<String, String> captured = new HashMap<>();

        @Override
        public void doFilter(jakarta.servlet.ServletRequest request, jakarta.servlet.ServletResponse response) {
            captured.put("traceId", MDC.get("traceId"));
            captured.put("method", MDC.get("method"));
            captured.put("path", MDC.get("path"));
            captured.put("userId", MDC.get("userId"));
            captured.put("projectId", MDC.get("projectId"));
            captured.put("keyType", MDC.get("keyType"));
        }
    }

    @Test
    void shouldPopulateTraceIdMethodAndPath() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/projects");
        when(response.getStatus()).thenReturn(200);
        MdcCapturingFilterChain chain = new MdcCapturingFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.captured.get("traceId")).isNotNull();
        assertThat(chain.captured.get("traceId")).hasSize(32);
        assertThat(chain.captured.get("method")).isEqualTo("GET");
        assertThat(chain.captured.get("path")).isEqualTo("/api/projects");
    }

    @Test
    void shouldPopulateUserIdForUserAuthentication() throws Exception {
        UserAuthentication userAuth = new UserAuthentication(42, "user@test.com", "Test User", "ADMIN", "active", null);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(userAuth);
        SecurityContextHolder.setContext(ctx);

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("POST");
        when(request.getRequestURI()).thenReturn("/api/flags");
        when(response.getStatus()).thenReturn(201);
        MdcCapturingFilterChain chain = new MdcCapturingFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.captured.get("userId")).isEqualTo("42");
    }

    @Test
    void shouldPopulateProjectIdForApiKeyAuthentication() throws Exception {
        ApiKeyAuthentication apiKeyAuth = new ApiKeyAuthentication("key123", 10, "My Key", 5, "SERVER");
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(apiKeyAuth);
        SecurityContextHolder.setContext(ctx);

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/client/flags");
        when(response.getStatus()).thenReturn(200);
        MdcCapturingFilterChain chain = new MdcCapturingFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.captured.get("projectId")).isEqualTo("10");
        assertThat(chain.captured.get("keyType")).isEqualTo("SERVER");
    }

    @Test
    void shouldUseDefaultKeyTypeWhenNull() throws Exception {
        ApiKeyAuthentication apiKeyAuth = new ApiKeyAuthentication("key456", 20, "Other Key", 5, null);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(apiKeyAuth);
        SecurityContextHolder.setContext(ctx);

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/flags");
        when(response.getStatus()).thenReturn(200);
        MdcCapturingFilterChain chain = new MdcCapturingFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.captured.get("keyType")).isEqualTo("SERVER");
    }

    @Test
    void shouldExtractProjectIdFromPath() throws Exception {
        UserAuthentication userAuth = new UserAuthentication(1, "a@b.com", "User", "admin", "active", null);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(userAuth);
        SecurityContextHolder.setContext(ctx);

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/projects/42/flags");
        when(response.getStatus()).thenReturn(200);
        MdcCapturingFilterChain chain = new MdcCapturingFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.captured.get("projectId")).isEqualTo("42");
    }

    @Test
    void shouldExtractProjectIdFromLongerPath() throws Exception {
        UserAuthentication userAuth = new UserAuthentication(1, "a@b.com", "User", "admin", "active", null);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(userAuth);
        SecurityContextHolder.setContext(ctx);

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/projects/99/environments/5");
        when(response.getStatus()).thenReturn(200);
        MdcCapturingFilterChain chain = new MdcCapturingFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.captured.get("projectId")).isEqualTo("99");
    }

    @Test
    void shouldNotSetProjectIdWhenNoProjectInPath() throws Exception {
        UserAuthentication userAuth = new UserAuthentication(1, "a@b.com", "User", "admin", "active", null);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(userAuth);
        SecurityContextHolder.setContext(ctx);

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/flags");
        when(response.getStatus()).thenReturn(200);
        MdcCapturingFilterChain chain = new MdcCapturingFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.captured.get("projectId")).isNull();
    }

    @Test
    void shouldHandleNullAuthentication() throws Exception {
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(ctx);

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/projects");
        when(response.getStatus()).thenReturn(200);
        MdcCapturingFilterChain chain = new MdcCapturingFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(chain.captured.get("userId")).isNull();
        assertThat(chain.captured.get("keyType")).isNull();
    }

    @Test
    void shouldCallFilterChain() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getRequestURI()).thenReturn("/api/flags");
        when(response.getStatus()).thenReturn(200);
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        verify(chain).doFilter(request, response);
    }
}
