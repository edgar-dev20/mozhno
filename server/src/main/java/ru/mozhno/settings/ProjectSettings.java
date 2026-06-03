package ru.mozhno.settings;

import java.time.Instant;

public class ProjectSettings {
    private Integer id;
    private Integer projectId;
    private boolean requireMfa;
    private int sessionTimeoutHours;
    private String ipWhitelist;
    private Instant createdAt;
    private Instant updatedAt;

    public ProjectSettings() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public boolean isRequireMfa() { return requireMfa; }
    public void setRequireMfa(boolean requireMfa) { this.requireMfa = requireMfa; }
    public int getSessionTimeoutHours() { return sessionTimeoutHours; }
    public void setSessionTimeoutHours(int sessionTimeoutHours) { this.sessionTimeoutHours = sessionTimeoutHours; }
    public String getIpWhitelist() { return ipWhitelist; }
    public void setIpWhitelist(String ipWhitelist) { this.ipWhitelist = ipWhitelist; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}