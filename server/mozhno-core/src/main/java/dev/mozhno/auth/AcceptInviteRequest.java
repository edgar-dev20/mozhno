package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for accepting a user invitation")
public record AcceptInviteRequest(
    @NotBlank
    @Schema(description = "Invitation token from the invite email")
    String token,

    @NotBlank
    @Schema(description = "Display name for the new user")
    String name,

    @NotBlank
    @Schema(description = "Password for the new user account")
    String password
) {}
