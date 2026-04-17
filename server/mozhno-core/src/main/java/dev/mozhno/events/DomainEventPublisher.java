package dev.mozhno.events;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import dev.mozhno.auth.UserAuthentication;

/**
 * Publishes {@link DomainEvent} instances through Spring's
 * {@link org.springframework.context.ApplicationEventPublisher} so that
 * registered listeners ({@link AuditEventListener}, {@link IntegrationEventListener})
 * can react to them.
 *
 * <p>Before publishing, enriches the event with the current user's identity
 * extracted from the {@link org.springframework.security.core.context.SecurityContext}.
 * Events published without an authenticated user context will have
 * {@code null} user fields.</p>
 */
@Component
public class DomainEventPublisher {
    private final ApplicationEventPublisher publisher;

    public DomainEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    /**
     * Publishes a domain event to all registered application listeners.
     * The event is enriched with the current authenticated user's identity.
     *
     * @param event the event to publish (user fields may be left null)
     */
    public void publish(DomainEvent event) {
        Integer userId = event.userId();
        String userName = event.userName();
        String userEmail = event.userEmail();

        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UserAuthentication userAuth) {
            userId = userId != null ? userId : userAuth.getUserId();
            userName = userName != null ? userName : userAuth.getName();
            userEmail = userEmail != null ? userEmail : userAuth.getEmail();
        }

        DomainEvent enriched = new DomainEvent(
            event.projectId(), event.action(), event.resourceType(),
            event.resourceId(), event.resourceName(), event.details(),
            userId, userName, userEmail
        );
        publisher.publishEvent(enriched);
    }
}