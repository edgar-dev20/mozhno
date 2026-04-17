package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response returned after a successful login or token refresh.
 */
public record LoginResponse(
    @Schema(description = "Access token (JWT)")
    String token,
    @Schema(description = "Refresh token (opaque)")
    String refreshToken,
    @Schema(description = "Authenticated user information")
    UserDto user
) {}
