package dev.mozhno.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public final class HttpUtils {

    private HttpUtils() {
    }

    /**
     * Returns the client IP address of the request.
     *
     * <p>Relies on the servlet container's forwarded-headers handling
     * ({@code server.forward-headers-strategy=native} → Tomcat RemoteIpValve),
     * which rewrites {@code remoteAddr} to the real client IP only when the TCP
     * peer is a trusted proxy. This avoids trusting a client-supplied
     * {@code X-Forwarded-For} header directly, which would let attackers spoof
     * their IP and bypass IP-based rate limiting.
     */
    public static String getClientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    public static String getClientIpFromCurrentRequest() {
        try {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes servletAttrs) {
                return getClientIp(servletAttrs.getRequest());
            }
        } catch (IllegalStateException ignored) {
        }
        return null;
    }
}
