package dev.mozhno.sdk;

import java.io.File;
import java.net.Proxy;
import java.util.concurrent.ScheduledExecutorService;

public class MozhnoConfig {
    private final String appName;
    private final String instanceId;
    private final String mozhnoUrl;
    private final String apiKey;
    private final MozhnoContextProvider contextProvider;
    private final int fetchTogglesInterval;
    private final int sendMetricsInterval;
    private final boolean synchronousFetchOnInitialisation;
    private final boolean disableMetrics;
    private final String environment;
    private final Proxy proxy;

    private MozhnoConfig(Builder builder) {
        this.appName = builder.appName;
        this.instanceId = builder.instanceId;
        this.mozhnoUrl = builder.mozhnoUrl;
        this.apiKey = builder.apiKey;
        this.contextProvider = builder.contextProvider;
        this.fetchTogglesInterval = builder.fetchTogglesInterval;
        this.sendMetricsInterval = builder.sendMetricsInterval;
        this.synchronousFetchOnInitialisation = builder.synchronousFetchOnInitialisation;
        this.disableMetrics = builder.disableMetrics;
        this.environment = builder.environment;
        this.proxy = builder.proxy;
    }

    public String getAppName() { return appName; }
    public String getInstanceId() { return instanceId; }
    public String getMozhnoUrl() { return mozhnoUrl; }
    public String getApiKey() { return apiKey; }
    public MozhnoContextProvider getContextProvider() { return contextProvider; }
    public int getFetchTogglesInterval() { return fetchTogglesInterval; }
    public int getSendMetricsInterval() { return sendMetricsInterval; }
    public boolean isSynchronousFetchOnInitialisation() { return synchronousFetchOnInitialisation; }
    public boolean isDisableMetrics() { return disableMetrics; }
    public String getEnvironment() { return environment; }
    public Proxy getProxy() { return proxy; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String appName;
        private String instanceId;
        private String mozhnoUrl;
        private String apiKey;
        private MozhnoContextProvider contextProvider;
        private int fetchTogglesInterval = 15;
        private int sendMetricsInterval = 60;
        private boolean synchronousFetchOnInitialisation = false;
        private boolean disableMetrics = false;
        private String environment;
        private Proxy proxy;

        public Builder appName(String appName) { this.appName = appName; return this; }
        public Builder instanceId(String instanceId) { this.instanceId = instanceId; return this; }
        public Builder mozhnoUrl(String mozhnoUrl) { this.mozhnoUrl = mozhnoUrl; return this; }
        public Builder apiKey(String apiKey) { this.apiKey = apiKey; return this; }
        public Builder contextProvider(MozhnoContextProvider contextProvider) { this.contextProvider = contextProvider; return this; }
        public Builder fetchTogglesInterval(int fetchTogglesInterval) { this.fetchTogglesInterval = fetchTogglesInterval; return this; }
        public Builder sendMetricsInterval(int sendMetricsInterval) { this.sendMetricsInterval = sendMetricsInterval; return this; }
        public Builder synchronousFetchOnInitialisation(boolean synchronousFetchOnInitialisation) { this.synchronousFetchOnInitialisation = synchronousFetchOnInitialisation; return this; }
        public Builder disableMetrics(boolean disableMetrics) { this.disableMetrics = disableMetrics; return this; }
        public Builder environment(String environment) { this.environment = environment; return this; }
        public Builder proxy(Proxy proxy) { this.proxy = proxy; return this; }

        public MozhnoConfig build() {
            if (appName == null) throw new IllegalArgumentException("appName is required");
            if (instanceId == null) throw new IllegalArgumentException("instanceId is required");
            if (mozhnoUrl == null) throw new IllegalArgumentException("mozhnoUrl is required");
            if (apiKey == null) throw new IllegalArgumentException("apiKey is required");
            return new MozhnoConfig(this);
        }
    }
}
