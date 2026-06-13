package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request payload for initiating password reset")
public record ForgotPasswordRequest(
    @NotBlank @Email
    @Schema(description = "Email address to send the reset link to", example = "user@example.com")
    String email
) {}
