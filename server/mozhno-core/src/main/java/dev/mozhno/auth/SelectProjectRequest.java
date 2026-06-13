package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for selecting a project context")
public record SelectProjectRequest(
    @Schema(description = "Project ID to switch to")
    Integer projectId
) {}
