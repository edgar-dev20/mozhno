package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Request payload for creating a new user")
public record UserCreateRequest(
    @NotBlank @Email
    @Schema(description = "Email address", example = "user@example.com")
    String email,

    @NotBlank
    @Schema(description = "Initial plaintext password")
    String password,

    @Schema(description = "Display name", nullable = true)
    String name,

    @NotBlank @Pattern(regexp = "admin|developer|viewer")
    @Schema(description = "User role: admin, developer, or viewer", example = "developer")
    String role,

    @Pattern(regexp = "ru|en")
    @Schema(description = "Preferred locale: ru or en (default ru)", nullable = true, example = "ru")
    String locale
) {}