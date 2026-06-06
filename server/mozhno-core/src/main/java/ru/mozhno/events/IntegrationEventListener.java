package ru.mozhno.events;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import ru.mozhno.integrations.Integration;
import ru.mozhno.integrations.IntegrationRepository;
import ru.mozhno.spi.NotificationSpi;
import ru.mozhno.spi.WebhookSpi;

import java.util.List;
import java.util.Map;

@Component
public class IntegrationEventListener {

    private static final Logger log = LoggerFactory.getLogger(IntegrationEventListener.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final IntegrationRepository integrationRepository;
    private final List<WebhookSpi> webhookProviders;
    private final List<NotificationSpi> notificationProviders;

    public IntegrationEventListener(IntegrationRepository integrationRepository,
                                    List<WebhookSpi> webhookProviders,
                                    List<NotificationSpi> notificationProviders) {
        this.integrationRepository = integrationRepository;
        this.webhookProviders = webhookProviders;
        this.notificationProviders = notificationProviders;
    }

    @EventListener
    public void onDomainEvent(DomainEvent event) {
        if (event.projectId() == null) {
            return;
        }

        List<Integration> integrations = integrationRepository.findByProjectId(event.projectId());

        for (Integration integration : integrations) {
            if (!integration.isEnabled()) {
                continue;
            }

            List<String> subscriptions = parseSubscriptions(integration.getEventSubscriptionsJson());
            if (subscriptions == null || !subscriptions.contains(event.action())) {
                continue;
            }

            String type = integration.getType();
            Map<String, Object> payload = Map.of(
                "action", event.action(),
                "resourceType", event.resourceType(),
                "resourceId", event.resourceId(),
                "resourceName", event.resourceName(),
                "details", event.details(),
                "projectId", event.projectId()
            );

            if ("webhook".equalsIgnoreCase(type)) {
                if (!webhookProviders.isEmpty()) {
                    webhookProviders.forEach(w -> w.fire(new WebhookSpi.WebhookPayload(
                        event.action(), event.projectId(), payload)));
                }
            } else if ("email".equalsIgnoreCase(type) || "telegram".equalsIgnoreCase(type)) {
                if (!notificationProviders.isEmpty()) {
                    notificationProviders.forEach(n -> n.send(new NotificationSpi.NotificationEvent(
                        type,
                        integration.getType(),
                        "Feature flag event: " + event.action(),
                        objectMapper.valueToTree(payload).toString(),
                        event.projectId()
                    )));
                }
            }
        }
    }

    private List<String> parseSubscriptions(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse integration subscriptions: {}", json, e);
            return null;
        }
    }
}
