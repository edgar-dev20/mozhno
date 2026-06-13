package dev.mozhno.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Persisted refresh token entity representing a single token in a token family.
 *
 * <p>Tokens in the same family are linked via {@code family} to enable
 * rotation and theft detection: if a previously used token is replayed,
 * the entire family is revoked.</p>
 */
@Getter
@Setter
@NoArgsConstructor
public class RefreshToken {
    private Integer id;
    private Integer userId;
    private String tokenHash;
    private String family;
    private Instant expiresAt;
    private Instant usedAt;
    private boolean revoked;
    private Instant createdAt;
    private String replacedByHash;
}
