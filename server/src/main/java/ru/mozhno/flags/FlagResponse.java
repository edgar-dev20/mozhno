package ru.mozhno.flags;

import java.time.Instant;
import java.util.List;

public class FlagResponse {
    private Integer id;
    private Integer projectId;
    private String name;
    private String key;
    private String description;
    private String flagType;
    private Instant createdAt;
    private List<TagValueResponse> tags;
    private boolean enabled;
    private Integer strategyId;
    private String strategyType;
    private Double percentage;
    private Double rolloutPercentage;
    private Integer contextDefinitionId;
    private String contextValuesJson;
    private Integer segmentId;

    public static class TagValueResponse {
        private Integer tagId;
        private String tagName;
        private String tagColor;
        private String value;

        public TagValueResponse() {}
        public TagValueResponse(Integer tagId, String tagName, String tagColor, String value) {
            this.tagId = tagId;
            this.tagName = tagName;
            this.tagColor = tagColor;
            this.value = value;
        }

        public Integer getTagId() { return tagId; }
        public void setTagId(Integer tagId) { this.tagId = tagId; }
        public String getTagName() { return tagName; }
        public void setTagName(String tagName) { this.tagName = tagName; }
        public String getTagColor() { return tagColor; }
        public void setTagColor(String tagColor) { this.tagColor = tagColor; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }

    public FlagResponse() {}

    public FlagResponse(Integer id, Integer projectId, String name, String key, String description, String flagType, Instant createdAt, List<TagValueResponse> tags, boolean enabled, Integer strategyId, String strategyType, Double percentage, Double rolloutPercentage, Integer contextDefinitionId, String contextValuesJson, Integer segmentId) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.key = key;
        this.description = description;
        this.flagType = flagType;
        this.createdAt = createdAt;
        this.tags = tags;
        this.enabled = enabled;
        this.strategyId = strategyId;
        this.strategyType = strategyType;
        this.percentage = percentage;
        this.rolloutPercentage = rolloutPercentage;
        this.contextDefinitionId = contextDefinitionId;
        this.contextValuesJson = contextValuesJson;
        this.segmentId = segmentId;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFlagType() { return flagType; }
    public void setFlagType(String flagType) { this.flagType = flagType; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<TagValueResponse> getTags() { return tags; }
    public void setTags(List<TagValueResponse> tags) { this.tags = tags; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Integer getStrategyId() { return strategyId; }
    public void setStrategyId(Integer strategyId) { this.strategyId = strategyId; }
    public String getStrategyType() { return strategyType; }
    public void setStrategyType(String strategyType) { this.strategyType = strategyType; }
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
}