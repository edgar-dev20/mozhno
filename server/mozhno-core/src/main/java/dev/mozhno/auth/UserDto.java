package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

/**
 * Public-facing data transfer object for a user, without the password hash.
 */
@Schema(description = "User information")
public record UserDto(
    @Schema(description = "Unique identifier")
    Integer id,
    @Schema(description = "Email address", example = "user@example.com")
    String email,
    @Schema(description = "Display name")
    String name,
    @Schema(description = "User role: ADMIN, DEVELOPER, EDITOR, or VIEWER", example = "DEVELOPER")
    String role,
    @Schema(description = "Account status: ACTIVE, PENDING, or DISABLED", example = "ACTIVE")
    String status,
    @Schema(description = "Avatar image filename", nullable = true)
    String avatar,
    @Schema(description = "Preferred locale: ru or en", example = "ru")
    String locale,
    @Schema(description = "When the user was created")
    Instant createdAt,
    @Schema(description = "When the user was last active", nullable = true)
    Instant lastActiveAt
) {}
