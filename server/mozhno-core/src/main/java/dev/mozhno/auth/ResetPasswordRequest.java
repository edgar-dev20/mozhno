package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for resetting a password")
public record ResetPasswordRequest(
    @NotBlank
    @Schema(description = "Password reset token from the email")
    String token,

    @NotBlank
    @Schema(description = "New password")
    String password
) {}
