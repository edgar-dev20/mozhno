package dev.mozhno.settings;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Schema(description = "Request body for updating project security settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSettingsUpdateRequest {
    @Schema(description = "Whether multi-factor authentication is required")
    private boolean requireMfa;

    @Schema(description = "Session timeout in hours", example = "24")
    private int sessionTimeoutHours;

    @Schema(description = "Optional IP whitelist for access control", nullable = true)
    private String ipWhitelist;

    @Schema(description = "Optional accent color (hex) for the project UI theme", example = "#3b82f1", nullable = true)
    private String accentColor;
}