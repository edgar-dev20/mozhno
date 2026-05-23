package ru.mozhno.flags;

public class FlagRequest {
    private Integer projectId;
    private String name;
    private String key;
    private String description;

    public FlagRequest() {}
    public FlagRequest(Integer projectId, String name, String key, String description) {
        this.projectId = projectId;
        this.name = name;
        this.key = key;
        this.description = description;
    }

    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}