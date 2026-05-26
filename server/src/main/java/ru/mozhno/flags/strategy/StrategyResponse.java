package ru.mozhno.flags.strategy;

import java.time.Instant;

public class StrategyResponse {
    private Integer id;
    private Integer flagId;
    private String type;
    private boolean enabled;
    private Double percentage;
    private String contextKey;
    private String segmentValue;
    private Double segmentPercentage;
    private Instant createdAt;

    public StrategyResponse() {}

    public StrategyResponse(Integer id, Integer flagId, String type, boolean enabled, Double percentage, String contextKey, String segmentValue, Double segmentPercentage, Instant createdAt) {
        this.id = id;
        this.flagId = flagId;
        this.type = type;
        this.enabled = enabled;
        this.percentage = percentage;
        this.contextKey = contextKey;
        this.segmentValue = segmentValue;
        this.segmentPercentage = segmentPercentage;
        this.createdAt = createdAt;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getFlagId() { return flagId; }
    public void setFlagId(Integer flagId) { this.flagId = flagId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public String getContextKey() { return contextKey; }
    public void setContextKey(String contextKey) { this.contextKey = contextKey; }
    public String getSegmentValue() { return segmentValue; }
    public void setSegmentValue(String segmentValue) { this.segmentValue = segmentValue; }
    public Double getSegmentPercentage() { return segmentPercentage; }
    public void setSegmentPercentage(Double segmentPercentage) { this.segmentPercentage = segmentPercentage; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}