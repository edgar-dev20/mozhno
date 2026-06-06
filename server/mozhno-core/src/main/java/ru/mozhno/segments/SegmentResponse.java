package ru.mozhno.segments;

import java.time.Instant;
import java.util.List;

public class SegmentResponse {
    private Integer id;
    private Integer projectId;
    private String name;
    private String description;
    private String icon;
    private String color;
    private List<ContextEntryResponse> context;
    private Instant createdAt;

    public SegmentResponse() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public List<ContextEntryResponse> getContext() { return context; }
    public void setContext(List<ContextEntryResponse> context) { this.context = context; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class ContextEntryResponse {
        private Integer contextDefinitionId;
        private String operator;
        private String contextValues;

        public ContextEntryResponse() {}

        public Integer getContextDefinitionId() { return contextDefinitionId; }
        public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
        public String getContextValues() { return contextValues; }
        public void setContextValues(String contextValues) { this.contextValues = contextValues; }
    }
}