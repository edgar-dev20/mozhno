package ru.mozhno.integrations;

import java.time.Instant;

public class Integration {
    private Integer id;
    private Integer projectId;
    private String type;
    private String name;
    private boolean enabled;
    private String configJson;
    private String eventSubscriptionsJson;
    private Instant createdAt;
    private Instant updatedAt;

    public Integration() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}