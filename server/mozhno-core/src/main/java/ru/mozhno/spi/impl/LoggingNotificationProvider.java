package ru.mozhno.spi.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import ru.mozhno.spi.NotificationSpi;

@Component
public class LoggingNotificationProvider implements NotificationSpi {

    private static final Logger log = LoggerFactory.getLogger(LoggingNotificationProvider.class);

    @Override
    public void send(NotificationEvent event) {
        log.info("Notification [{}] to {}: {} — {}", event.type(), event.recipient(), event.subject(), event.body());
    }
}
