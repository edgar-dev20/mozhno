package dev.mozhno.logging;

import dev.mozhno.security.ApiKeyAuthentication;
import dev.mozhno.auth.UserAuthentication;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LoggingMdcFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(LoggingMdcFilter.class);
    private static final Pattern PROJECT_ID_PATH = Pattern.compile("/projects/(\\d+)/");
    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String TRACE_ID_HEADER = "X-Trace-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString().replace("-", "");
        }
        String traceId = requestId;
        long startTime = System.currentTimeMillis();

        MDC.put("traceId", traceId);
        MDC.put("method", request.getMethod());
        MDC.put("path", request.getRequestURI());

        response.setHeader(TRACE_ID_HEADER, traceId);

        populateAuthContext(request);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long latency = System.currentTimeMillis() - startTime;
            MDC.put("latencyMs", String.valueOf(latency));
            MDC.put("statusCode", String.valueOf(response.getStatus()));
            log.info("{} {} {} {}ms", request.getMethod(), request.getRequestURI(),
                response.getStatus(), latency);
            MDC.clear();
        }
    }

    private void populateAuthContext(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return;

        if (auth instanceof UserAuthentication userAuth) {
            MDC.put("userId", String.valueOf(userAuth.getUserId()));
        } else if (auth instanceof ApiKeyAuthentication apiKeyAuth) {
            MDC.put("projectId", String.valueOf(apiKeyAuth.getProjectId()));
            MDC.put("keyType", apiKeyAuth.getKeyType() != null ? apiKeyAuth.getKeyType() : "SERVER");
        } else if (auth.getPrincipal() instanceof String principal && !"anonymousUser".equals(principal)) {
            MDC.put("userId", principal);
        }

        String path = request.getRequestURI();
        Matcher m = PROJECT_ID_PATH.matcher(path);
        if (m.find()) {
            MDC.put("projectId", m.group(1));
        }
    }
}
