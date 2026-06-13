package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Request payload for initiating password reset")
public record ForgotPasswordRequest(
    @NotBlank @Email
    @Schema(description = "Email address to send the reset link to", example = "user@example.com")
    String email,

    @Pattern(regexp = "ru|en")
    @Schema(description = "Preferred locale for email: ru or en (default ru)", nullable = true, example = "ru")
    String locale
) {}
