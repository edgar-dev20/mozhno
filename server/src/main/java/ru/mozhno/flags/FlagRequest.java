package ru.mozhno.flags;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class FlagRequest {
    private Integer projectId;
    @NotBlank @Size(max = 255) private String name;
    @NotBlank @Size(max = 255) private String key;
    @Size(max = 1000) private String description;
    private String flagType;
    private List<TagValue> tags;
    private Boolean enabled;

    public FlagRequest() {}

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
    public String getFlagType() { return flagType; }
    public void setFlagType(String flagType) { this.flagType = flagType; }
    public List<TagValue> getTags() { return tags; }
    public void setTags(List<TagValue> tags) { this.tags = tags; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}