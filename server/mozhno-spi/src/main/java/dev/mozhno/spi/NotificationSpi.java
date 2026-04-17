package dev.mozhno.spi;

/**
 * Service Provider Interface for sending notifications.
 * <p>
 * In the Open Core architecture, the community edition uses SMTP for email
 * delivery. Licensed editions can provide an SPI implementation that routes
 * notifications through external services such as SendGrid, Slack, Teams,
 * or a custom message broker.
 */
public interface NotificationSpi {

    /**
     * Sends the given notification event to its recipient.
     *
     * @param event the notification to send
     */
    void send(NotificationEvent event);

    /**
     * A notification event to be delivered.
     *
     * @param type      the notification type (e.g. {@code "EMAIL"}, {@code "SLACK"})
     * @param recipient the recipient address or channel
     * @param subject   the notification subject line
     * @param body      the notification body content
     * @param projectId the project that triggered the notification
     */
    record NotificationEvent(
        String type,
        String recipient,
        String subject,
        String body,
        Integer projectId
    ) {}
}
