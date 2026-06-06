package ru.mozhno.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UserCreateRequest(
    @NotBlank @Email String email,
    @NotBlank String password,
    String name,
    @NotBlank @Pattern(regexp = "admin|developer|editor|viewer") String role
) {}