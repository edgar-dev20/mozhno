package ru.mozhno.settings;

public class ProjectSettingsUpdateRequest {
    private boolean requireMfa;
    private int sessionTimeoutHours;
    private String ipWhitelist;

    public boolean isRequireMfa() { return requireMfa; }
    public void setRequireMfa(boolean requireMfa) { this.requireMfa = requireMfa; }
    public int getSessionTimeoutHours() { return sessionTimeoutHours; }
    public void setSessionTimeoutHours(int sessionTimeoutHours) { this.sessionTimeoutHours = sessionTimeoutHours; }
    public String getIpWhitelist() { return ipWhitelist; }
    public void setIpWhitelist(String ipWhitelist) { this.ipWhitelist = ipWhitelist; }
}