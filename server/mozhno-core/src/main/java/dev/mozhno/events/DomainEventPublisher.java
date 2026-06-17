package dev.mozhno.events;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import dev.mozhno.auth.RequestContext;

@Component
public class DomainEventPublisher {
    private final ApplicationEventPublisher publisher;
    private final RequestContext requestContext;

    public DomainEventPublisher(ApplicationEventPublisher publisher, RequestContext requestContext) {
        this.publisher = publisher;
        this.requestContext = requestContext;
    }

    public void publish(DomainEvent event) {
        Integer userId = event.userId();
        String userName = event.userName();
        String userEmail = event.userEmail();

        if (requestContext.isAuthenticated()) {
            userId = userId != null ? userId : requestContext.getUserId();
            userName = userName != null ? userName : requestContext.getUserName();
            userEmail = userEmail != null ? userEmail : requestContext.getUserEmail();
        }

        DomainEvent enriched = new DomainEvent(
            event.projectId(), event.action(), event.resourceType(),
            event.resourceId(), event.resourceName(), event.details(),
            userId, userName, userEmail
        );
        publisher.publishEvent(enriched);
    }
}
