package dev.mozhno.settings;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.Instant;

@Schema(description = "Security settings for a project")
@Builder
public record ProjectSettingsResponse(
    @Schema(description = "Unique identifier")
    Integer id,

    @Schema(description = "Project ID")
    Integer projectId,

    @Schema(description = "Whether multi-factor authentication is required")
    boolean requireMfa,

    @Schema(description = "Session timeout in hours", example = "24")
    int sessionTimeoutHours,

    @Schema(description = "Optional IP whitelist for access control", nullable = true)
    String ipWhitelist,

    @Schema(description = "Optional accent color (hex) for the project UI theme", nullable = true)
    String accentColor,

    @Schema(description = "When the settings were created")
    Instant createdAt,

    @Schema(description = "When the settings were last updated")
    Instant updatedAt
) {}
