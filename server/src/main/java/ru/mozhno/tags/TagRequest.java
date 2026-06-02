package ru.mozhno.tags;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TagRequest {
    private Integer projectId;
    @NotBlank @Size(max = 255) private String name;
    @Size(max = 1000) private String description;
    @Size(max = 50) private String color;

    public TagRequest() {}
    public TagRequest(Integer projectId, String name, String description, String color) {
        this.projectId = projectId;
        this.name = name;
        this.description = description;
        this.color = color;
    }

    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}