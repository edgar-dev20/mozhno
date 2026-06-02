package ru.mozhno.auth;

public record LoginResponse(
    String token,
    UserDto user
) {}