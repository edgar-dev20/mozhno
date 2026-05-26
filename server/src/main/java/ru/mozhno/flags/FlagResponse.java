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

    public FlagResponse(Integer id, Integer projectId, String name, String key, String description, String flagType, Instant createdAt, List<TagValueResponse> tags) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.key = key;
        this.description = description;
        this.flagType = flagType;
        this.createdAt = createdAt;
        this.tags = tags;
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
}