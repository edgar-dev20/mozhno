package ru.mozhno.contexts;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class ContextDefinition {
    private Integer id;
    private String name;
    private String contextKey;
    private String contextType;
    private String createdBy;
    private String description;
    private Integer projectId;
    private Instant createdAt;

    public ContextDefinition() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    @JsonProperty("key")
    public String getContextKey() { return contextKey; }
    public void setContextKey(String contextKey) { this.contextKey = contextKey; }
    @JsonProperty("type")
    public String getContextType() { return contextType; }
    public void setContextType(String contextType) { this.contextType = contextType; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
