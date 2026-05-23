package ru.mozhno.flags.strategy;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("TARGETING")
public class TargetingStrategy extends FlagStrategy {
    @Column(name = "context_definition_id")
    private Integer contextDefinitionId;

    @Column(name = "context_values_json")
    private String contextValuesJson;

    @Column(name = "rollout_percentage")
    private Double rolloutPercentage;

    @Override
    public String getStrategyType() { return "TARGETING"; }

    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getContextValuesJson() { return contextValuesJson; }
    public void setContextValuesJson(String contextValuesJson) { this.contextValuesJson = contextValuesJson; }
    public Double getRolloutPercentage() { return rolloutPercentage; }
    public void setRolloutPercentage(Double rolloutPercentage) { this.rolloutPercentage = rolloutPercentage; }
}