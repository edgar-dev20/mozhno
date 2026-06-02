package ru.mozhno.flags.strategy;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StrategyRequest {
    private Integer flagId;
    @NotNull private Integer environmentId;
    @NotBlank private String type;
    private Boolean enabled;
    private Double percentage;
    private Integer contextDefinitionId;
    @Size(max = 5000) private String contextValuesJson;
    private Double rolloutPercentage;
    private Integer segmentId;

    public StrategyRequest() {}

    public Integer getFlagId() { return flagId; }
    public void setFlagId(Integer flagId) { this.flagId = flagId; }
    public Integer getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(Integer environmentId) { this.environmentId = environmentId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getContextValuesJson() { return contextValuesJson; }
    public void setContextValuesJson(String contextValuesJson) { this.contextValuesJson = contextValuesJson; }
    public Double getRolloutPercentage() { return rolloutPercentage; }
    public void setRolloutPercentage(Double rolloutPercentage) { this.rolloutPercentage = rolloutPercentage; }
    public Integer getSegmentId() { return segmentId; }
    public void setSegmentId(Integer segmentId) { this.segmentId = segmentId; }
}