package ru.mozhno.contexts;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ContextDefinitionRequest {
    private Integer projectId;
    @NotBlank @Size(max = 255) private String name;
    @Size(max = 1000) private String description;

    public ContextDefinitionRequest() {}

    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}