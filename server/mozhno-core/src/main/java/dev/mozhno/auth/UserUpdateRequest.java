package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Partial update payload for a user")
public record UserUpdateRequest(
    @Schema(description = "New plaintext password", nullable = true)
    String password,

    @Pattern(regexp = "admin|developer|viewer")
    @Schema(description = "User role: admin, developer, or viewer", nullable = true, example = "developer")
    String role,

    @Pattern(regexp = "active|invited|suspended")
    @Schema(description = "Account status: active, invited, or suspended", nullable = true, example = "active")
    String status,

    @Pattern(regexp = "ru|en")
    @Schema(description = "Preferred locale: ru or en", nullable = true, example = "ru")
    String locale
) {}
