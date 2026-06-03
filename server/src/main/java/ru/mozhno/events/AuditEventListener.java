package ru.mozhno.events;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.event.EventListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import ru.mozhno.audit.AuditService;
import ru.mozhno.auth.UserAuthentication;

@Component
public class AuditEventListener {
    private final AuditService auditService;

    public AuditEventListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @EventListener
    public void onDomainEvent(DomainEvent event) {
        Integer userId = null;
        String userName = "system";
        String userEmail = "system";

        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UserAuthentication userAuth) {
            userId = userAuth.getUserId();
            userName = userAuth.getName();
            userEmail = userAuth.getEmail();
        }

        String ip = resolveIp();

        auditService.log(event.projectId(), userId, userName, userEmail, event.action(),
            event.resourceType(), event.resourceId(), event.resourceName(),
            event.details(), ip);
    }

    private String resolveIp() {
        try {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes servletAttrs) {
                HttpServletRequest request = servletAttrs.getRequest();
                String xff = request.getHeader("X-Forwarded-For");
                if (xff != null && !xff.isBlank()) {
                    return xff.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (IllegalStateException ignored) {
        }
        return null;
    }
}