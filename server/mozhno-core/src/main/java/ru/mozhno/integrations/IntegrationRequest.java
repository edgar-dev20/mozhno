package ru.mozhno.integrations;

public class IntegrationRequest {
    private Integer projectId;
    private String type;
    private String name;
    private boolean enabled;
    private String configJson;
    private String eventSubscriptionsJson;

    public IntegrationRequest() {}

    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getConfigJson() { return configJson; }
    public void setConfigJson(String configJson) { this.configJson = configJson; }
    public String getEventSubscriptionsJson() { return eventSubscriptionsJson; }
    public void setEventSubscriptionsJson(String eventSubscriptionsJson) { this.eventSubscriptionsJson = eventSubscriptionsJson; }
}