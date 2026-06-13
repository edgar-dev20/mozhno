package dev.mozhno.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request payload for token refresh")
public record RefreshTokenRequest(
    @Schema(description = "The raw (unhashed) refresh token")
    String refreshToken
) {}
