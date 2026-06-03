package ru.mozhno.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record UserUpdateRequest(
    @Email String email,
    String password,
    String name,
    @Pattern(regexp = "admin|developer|editor|viewer") String role,
    @Pattern(regexp = "active|invited|suspended") String status
) {}