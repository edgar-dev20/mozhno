package ru.mozhno.flags.strategy;

import java.time.Instant;
import java.util.List;

public class FlagStrategy {
    private Integer id;
    private Integer flagId;
    private Integer environmentId;
    private boolean enabled;
    private Double percentage;
    private Integer contextDefinitionId;
    private String contextName;
    private String contextValuesJson;
    private List<Integer> segmentIds;
    private Instant createdAt;
    private Instant lastUsedAt;

    public FlagStrategy() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getFlagId() { return flagId; }
    public void setFlagId(Integer flagId) { this.flagId = flagId; }
    public Integer getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(Integer environmentId) { this.environmentId = environmentId; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getContextName() { return contextName; }
    public void setContextName(String contextName) { this.contextName = contextName; }
    public String getContextValuesJson() { return contextValuesJson; }
    public void setContextValuesJson(String contextValuesJson) { this.contextValuesJson = contextValuesJson; }
    public List<Integer> getSegmentIds() { return segmentIds; }
    public void setSegmentIds(List<Integer> segmentIds) { this.segmentIds = segmentIds; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }
}