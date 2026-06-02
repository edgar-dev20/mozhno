package ru.mozhno.auth;

public record UserDto(
    Integer id,
    String email,
    String role
) {}