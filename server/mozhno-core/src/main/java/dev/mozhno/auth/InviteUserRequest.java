package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Request payload for inviting a new user")
public record InviteUserRequest(
    @NotBlank @Email
    @Schema(description = "Email address of the user to invite", example = "user@example.com")
    String email,

    @NotBlank @Pattern(regexp = "admin|developer|viewer")
    @Schema(description = "User role: admin, developer, or viewer", example = "developer")
    String role,

    @Schema(description = "Display name of the invited user", nullable = true)
    String name,

    @Pattern(regexp = "ru|en")
    @Schema(description = "Preferred locale for email: ru or en (default ru)", nullable = true, example = "ru")
    String locale
) {}
