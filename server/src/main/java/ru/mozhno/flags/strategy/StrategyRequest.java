package ru.mozhno.flags.strategy;

import jakarta.validation.constraints.Size;
import java.util.List;

public class StrategyRequest {
    private Integer flagId;
    private Integer environmentId;
    private Boolean enabled;
    private Double percentage;
    private Integer contextDefinitionId;
    @Size(max = 5000) private String contextValuesJson;
    private List<Integer> segmentIds;

    public StrategyRequest() {}

    public Integer getFlagId() { return flagId; }
    public void setFlagId(Integer flagId) { this.flagId = flagId; }
    public Integer getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(Integer environmentId) { this.environmentId = environmentId; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getContextValuesJson() { return contextValuesJson; }
    public void setContextValuesJson(String contextValuesJson) { this.contextValuesJson = contextValuesJson; }
    public List<Integer> getSegmentIds() { return segmentIds; }
    public void setSegmentIds(List<Integer> segmentIds) { this.segmentIds = segmentIds; }
}