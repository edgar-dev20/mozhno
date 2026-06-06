package ru.mozhno.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public record LoginRequest(
    @NotBlank @Email String email,
    String password,
    Boolean rememberMe,
    String provider,
    Map<String, String> params
) {}