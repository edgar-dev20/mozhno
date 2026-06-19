package dev.mozhno.sdk.spring;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import dev.mozhno.sdk.DefaultMozhnoClient;
import dev.mozhno.sdk.MozhnoClient;
import dev.mozhno.sdk.MozhnoConfig;
import dev.mozhno.sdk.MozhnoContextProvider;

import java.util.UUID;

@Configuration
@EnableConfigurationProperties(MozhnoProperties.class)
@ConditionalOnProperty(prefix = "mozhno", name = "enabled", havingValue = "true", matchIfMissing = true)
public class MozhnoAutoConfiguration {

    private final MozhnoProperties properties;
    private final MozhnoContextProvider contextProvider;

    public MozhnoAutoConfiguration(MozhnoProperties properties,
                                    @Autowired(required = false) MozhnoContextProvider contextProvider) {
        this.properties = properties;
        this.contextProvider = contextProvider;
    }

    @Bean(destroyMethod = "stop")
    @ConditionalOnMissingBean
    public MozhnoClient mozhnoClient() {
        MozhnoConfig.Builder builder = MozhnoConfig.builder()
            .appName(properties.getAppName())
            .instanceId(properties.getInstanceId() != null ? properties.getInstanceId() : UUID.randomUUID().toString())
            .mozhnoUrl(properties.getUrl())
            .apiKey(properties.getApiKey())
            .fetchTogglesInterval(properties.getFetchTogglesInterval())
            .sendMetricsInterval(properties.getSendMetricsInterval())
            .disableMetrics(properties.isDisableMetrics())
            .synchronousFetchOnInitialisation(properties.isSynchronousFetch());

        if (properties.getEnvironment() != null) {
            builder.environment(properties.getEnvironment());
        }

        if (contextProvider != null) {
            builder.contextProvider(contextProvider);
        }

        MozhnoConfig config = builder.build();
        MozhnoClient client = new DefaultMozhnoClient(config);
        client.start();
        return client;
    }
}
