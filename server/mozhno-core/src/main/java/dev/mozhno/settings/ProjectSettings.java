package dev.mozhno.settings;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Security settings for a project, including MFA requirement, session timeout, and IP whitelist.
 */
@Getter
@Setter
@NoArgsConstructor
public class ProjectSettings {
    /** Unique identifier. */
    private Integer id;
    /** Project ID. */
    private Integer projectId;
    /** Whether multi-factor authentication is required. */
    private boolean requireMfa;
    /** Session timeout in hours. */
    private int sessionTimeoutHours;
    /** Optional IP whitelist for access control. */
    private String ipWhitelist;
    /** Optional accent color (hex) for the project UI theme. */
    private String accentColor;
    /** When the settings were created. */
    private Instant createdAt;
    /** When the settings were last updated. */
    private Instant updatedAt;
}
