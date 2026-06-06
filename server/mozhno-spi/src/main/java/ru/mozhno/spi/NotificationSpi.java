package ru.mozhno.spi;

public interface NotificationSpi {

    void send(NotificationEvent event);

    record NotificationEvent(
        String type,
        String recipient,
        String subject,
        String body,
        Integer projectId
    ) {}
}
