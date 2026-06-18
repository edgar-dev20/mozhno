package dev.mozhno.events;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import dev.mozhno.integrations.CustomWebhookService;
import dev.mozhno.integrations.Integration;
import dev.mozhno.integrations.IntegrationRepository;

import java.io.IOException;
import java.util.List;

/**
 * Bridges domain events to custom webhook integrations.
 *
 * <p>For each domain event with a non-null project id, this listener queries
 * the project's enabled integrations. Matching {@code custom_webhook}
 * integrations trigger HTTP POST delivery via {@link CustomWebhookService}.</p>
 */
@Component
public class IntegrationEventListener {

    private static final Logger log = LoggerFactory.getLogger(IntegrationEventListener.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final IntegrationRepository integrationRepository;
    private final CustomWebhookService customWebhookService;

    public IntegrationEventListener(IntegrationRepository integrationRepository,
                                    CustomWebhookService customWebhookService) {
        this.integrationRepository = integrationRepository;
        this.customWebhookService = customWebhookService;
    }

    /**
     * Processes a domain event by dispatching it to matching custom webhook integrations.
     *
     * @param event the domain event
     */
    @Async("webhookExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
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

            if ("custom_webhook".equals(integration.getType())) {
                customWebhookService.dispatch(integration, event);
            }
        }
    }

    private List<String> parseSubscriptions(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (IOException e) {
            log.warn("Failed to parse integration subscriptions: {}", json, e);
            return null;
        }
    }
}
