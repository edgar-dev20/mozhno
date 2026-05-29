package ru.mozhno.flags.strategy;

import java.time.Instant;

public class FlagStrategy {
    private Integer id;
    private Integer flagId;
    private Integer environmentId;
    private String strategyType;
    private boolean enabled;
    private Double percentage;
    private Double rolloutPercentage;
    private Integer contextDefinitionId;
    private String contextValuesJson;
    private Integer segmentId;
    private Instant createdAt;

    public FlagStrategy() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getFlagId() { return flagId; }
    public void setFlagId(Integer flagId) { this.flagId = flagId; }
    public Integer getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(Integer environmentId) { this.environmentId = environmentId; }
    public String getStrategyType() { return strategyType; }
    public void setStrategyType(String strategyType) { this.strategyType = strategyType; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Double getRolloutPercentage() { return rolloutPercentage; }
    public void setRolloutPercentage(Double rolloutPercentage) { this.rolloutPercentage = rolloutPercentage; }
    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getContextValuesJson() { return contextValuesJson; }
    public void setContextValuesJson(String contextValuesJson) { this.contextValuesJson = contextValuesJson; }
    public Integer getSegmentId() { return segmentId; }
    public void setSegmentId(Integer segmentId) { this.segmentId = segmentId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}