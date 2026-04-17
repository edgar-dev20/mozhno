package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Partial update payload for a user")
public record UserUpdateRequest(
    @Email
    @Schema(description = "New email address (must be unique if changed)", nullable = true, example = "user@example.com")
    String email,

    @Schema(description = "New plaintext password", nullable = true)
    String password,

    @Schema(description = "New display name", nullable = true)
    String name,

    @Pattern(regexp = "admin|developer|editor|viewer")
    @Schema(description = "User role: admin, developer, editor, or viewer", nullable = true, example = "developer")
    String role,

    @Pattern(regexp = "active|invited|suspended")
    @Schema(description = "Account status: active, invited, or suspended", nullable = true, example = "active")
    String status
) {}