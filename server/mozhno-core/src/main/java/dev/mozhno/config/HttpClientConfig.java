package dev.mozhno.config;

import dev.mozhno.integrations.WebhookProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.concurrent.Executors;

@Configuration
public class HttpClientConfig {

    @Bean
    public HttpClient webhookHttpClient(WebhookProperties webhookProperties) {
        return HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(webhookProperties.getConnectTimeoutSeconds()))
            .executor(Executors.newVirtualThreadPerTaskExecutor())
            .build();
    }
}
