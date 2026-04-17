package dev.mozhno.sdk.spring;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "mozhno")
public class MozhnoProperties {
    private String url;
    private String apiKey;
    private String appName;
    private String instanceId;
    private String environment;
    private int fetchTogglesInterval = 15;
    private int sendMetricsInterval = 60;
    private boolean disableMetrics = false;
    private boolean synchronousFetch = false;

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getAppName() { return appName; }
    public void setAppName(String appName) { this.appName = appName; }
    public String getInstanceId() { return instanceId; }
    public void setInstanceId(String instanceId) { this.instanceId = instanceId; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public int getFetchTogglesInterval() { return fetchTogglesInterval; }
    public void setFetchTogglesInterval(int fetchTogglesInterval) { this.fetchTogglesInterval = fetchTogglesInterval; }
    public int getSendMetricsInterval() { return sendMetricsInterval; }
    public void setSendMetricsInterval(int sendMetricsInterval) { this.sendMetricsInterval = sendMetricsInterval; }
    public boolean isDisableMetrics() { return disableMetrics; }
    public void setDisableMetrics(boolean disableMetrics) { this.disableMetrics = disableMetrics; }
    public boolean isSynchronousFetch() { return synchronousFetch; }
    public void setSynchronousFetch(boolean synchronousFetch) { this.synchronousFetch = synchronousFetch; }
}
