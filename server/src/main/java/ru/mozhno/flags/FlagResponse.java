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
    private Double percentage;
    private Integer contextDefinitionId;
    private String contextValuesJson;
    private List<Integer> segmentIds;
    private boolean archived;

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

    public FlagResponse(Integer id, Integer projectId, String name, String key, String description, String flagType, Instant createdAt, List<TagValueResponse> tags, boolean enabled, Integer strategyId, Double percentage, Integer contextDefinitionId, String contextValuesJson, List<Integer> segmentIds, boolean archived) {
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
        this.percentage = percentage;
        this.contextDefinitionId = contextDefinitionId;
        this.contextValuesJson = contextValuesJson;
        this.segmentIds = segmentIds;
        this.archived = archived;
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
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getContextValuesJson() { return contextValuesJson; }
    public void setContextValuesJson(String contextValuesJson) { this.contextValuesJson = contextValuesJson; }
    public List<Integer> getSegmentIds() { return segmentIds; }
    public void setSegmentIds(List<Integer> segmentIds) { this.segmentIds = segmentIds; }
    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }
}