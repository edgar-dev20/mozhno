package ru.mozhno.auth;

public record LoginResponse(
    String token,
    String refreshToken,
    UserDto user
) {}