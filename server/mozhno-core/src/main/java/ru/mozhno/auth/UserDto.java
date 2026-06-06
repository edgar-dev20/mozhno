package ru.mozhno.auth;

import java.time.Instant;

public record UserDto(
    Integer id,
    String email,
    String name,
    String role,
    String status,
    Instant createdAt,
    Instant lastActiveAt
) {}