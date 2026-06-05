package ru.mozhno.segments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SegmentRequest {
    private Integer projectId;
    @NotBlank @Size(max = 255) private String name;
    @Size(max = 1000) private String description;
    private java.util.List<ContextEntry> context;

    public SegmentRequest() {}

    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public java.util.List<ContextEntry> getContext() { return context; }
    public void setContext(java.util.List<ContextEntry> context) { this.context = context; }

    public static class ContextEntry {
        private Integer contextDefinitionId;
        private String operator;
        private String contextValues;

        public ContextEntry() {}

        public Integer getContextDefinitionId() { return contextDefinitionId; }
        public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
        public String getContextValues() { return contextValues; }
        public void setContextValues(String contextValues) { this.contextValues = contextValues; }
    }
}