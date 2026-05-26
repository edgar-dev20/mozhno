package ru.mozhno.tags;

public class TagRequest {
    private Integer projectId;
    private String name;
    private String description;
    private String color;

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