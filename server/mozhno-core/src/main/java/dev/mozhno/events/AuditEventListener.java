package dev.mozhno.events;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import dev.mozhno.auth.UserAuthentication;
import dev.mozhno.spi.AuditSpi;
import dev.mozhno.util.RequestUtils;

/**
 * Bridges domain events to the registered {@link dev.mozhno.spi.AuditSpi} implementation.
 *
 * <p>Listens for {@link DomainEvent} publications, extracts the current user
 * from the security context and the client IP from the request, then delegates
 * to {@link AuditSpi#log} for persistence.</p>
 */
@Component
public class AuditEventListener {
    private final AuditSpi auditSpi;

    public AuditEventListener(AuditSpi auditSpi) {
        this.auditSpi = auditSpi;
    }

    /**
     * Handles a domain event by creating an audit record.
     *
     * @param event the domain event
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
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

        auditSpi.log(new AuditSpi.AuditRecord(
            event.projectId(), userId, userName, userEmail, event.action(),
            event.resourceType(), event.resourceId(), event.resourceName(),
            event.details(), ip));
    }

    private String resolveIp() {
        try {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes servletAttrs) {
                HttpServletRequest request = servletAttrs.getRequest();
                return RequestUtils.resolveClientIp(request);
            }
        } catch (IllegalStateException ignored) {
        }
        return null;
    }
}