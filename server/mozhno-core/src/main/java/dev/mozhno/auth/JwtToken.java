package dev.mozhno.auth;

import lombok.Value;

/**
 * Value object holding the claims extracted from a parsed JWT access token.
 */
@Value
public class JwtToken {
    Integer userId;
    String email;
    String name;
    String role;
    String status;
    Integer projectId;
}