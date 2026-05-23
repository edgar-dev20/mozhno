package ru.mozhno.flags;

import java.util.List;
import java.util.Map;

public class FlagRequest {
    private Integer projectId;
    private String name;
    private String key;
    private String description;
    private List<TagValue> tags;

    public FlagRequest() {}
    public FlagRequest(Integer projectId, String name, String key, String description, List<TagValue> tags) {
        this.projectId = projectId;
        this.name = name;
        this.key = key;
        this.description = description;
        this.tags = tags;
    }

    public static class TagValue {
        private Integer tagId;
        private String value;

        public TagValue() {}
        public TagValue(Integer tagId, String value) {
            this.tagId = tagId;
            this.value = value;
        }

        public Integer getTagId() { return tagId; }
        public void setTagId(Integer tagId) { this.tagId = tagId; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }

    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<TagValue> getTags() { return tags; }
    public void setTags(List<TagValue> tags) { this.tags = tags; }
}