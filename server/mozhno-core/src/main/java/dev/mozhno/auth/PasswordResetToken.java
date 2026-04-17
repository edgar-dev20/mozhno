package dev.mozhno.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class PasswordResetToken {
    private Integer id;
    private Integer userId;
    private String tokenHash;
    private Instant expiresAt;
    private Instant usedAt;
    private Instant createdAt;
}
