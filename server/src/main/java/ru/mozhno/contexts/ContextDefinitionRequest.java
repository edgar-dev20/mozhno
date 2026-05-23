package ru.mozhno.contexts;

public class ContextDefinitionRequest {
    private Integer projectId;
    private String name;
    private String description;

    public ContextDefinitionRequest() {}

    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}