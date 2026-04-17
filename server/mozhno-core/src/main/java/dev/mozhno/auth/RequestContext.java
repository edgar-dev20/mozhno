package dev.mozhno.auth;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;

/**
 * Request-scoped context holding the authenticated user's identity.
 * Extracted from the security context once per request, avoiding direct
 * SecurityContextHolder reads in business layer code.
 */
@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestContext {

    private final Integer userId;
    private final String userEmail;
    private final String userName;
    private final String userRole;

    public RequestContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UserAuthentication userAuth) {
            this.userId = userAuth.getUserId();
            this.userEmail = userAuth.getEmail();
            this.userName = userAuth.getName();
            this.userRole = userAuth.getRole();
        } else {
            this.userId = null;
            this.userEmail = null;
            this.userName = null;
            this.userRole = null;
        }
    }

    public Integer getUserId() { return userId; }
    public String getUserEmail() { return userEmail; }
    public String getUserName() { return userName; }
    public String getUserRole() { return userRole; }

    public boolean isAuthenticated() {
        return userId != null;
    }
}
