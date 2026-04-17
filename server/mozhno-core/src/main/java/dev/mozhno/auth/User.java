package dev.mozhno.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Domain entity representing a registered user.
 */
@Getter
@Setter
@NoArgsConstructor
public class User {
    private Integer id;
    private String email;
    private String passwordHash;
    private String name;
    private String role;
    private String status;
    private String avatar;
    private byte[] avatarData;
    private Instant createdAt;
    private Instant lastActiveAt;
}