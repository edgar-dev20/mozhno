package ru.mozhno.flags.strategy;

public class StrategyRequest {
    private Integer flagId;
    private Integer environmentId;
    private String type;
    private Boolean enabled;
    private Double percentage;
    private Integer contextDefinitionId;
    private String contextValuesJson;
    private Double rolloutPercentage;

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
}