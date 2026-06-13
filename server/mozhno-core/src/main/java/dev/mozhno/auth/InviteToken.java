package dev.mozhno.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class InviteToken {
    private Integer id;
    private String email;
    private String role;
    private Integer createdBy;
    private String tokenHash;
    private String locale;
    private Instant expiresAt;
    private Instant usedAt;
    private Instant createdAt;
}
