package dev.mozhno.auth;

import dev.mozhno.BaseIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RefreshTokenRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private RefreshTokenRepository repository;

    private Integer userId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
            "refresh-test@test.com", "$2a$10$hash", "admin", "active");
        userId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, "refresh-test@test.com");
        jdbcTemplate.execute("DELETE FROM refresh_tokens");
    }

    @Test
    void save_insert_shouldCreateAndReturnToken() {
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setFamily("family-1");
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));

        RefreshToken saved = repository.save(token);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getTokenHash()).isEqualTo(token.getTokenHash());
        assertThat(saved.getFamily()).isEqualTo("family-1");
        assertThat(saved.isRevoked()).isFalse();
        assertThat(saved.getCreatedAt()).isNotNull();
    }

    @Test
    void save_update_shouldUpdateAndReturnToken() {
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setFamily("family-2");
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        RefreshToken saved = repository.save(token);

        saved.setUsedAt(Instant.now());
        saved.setRevoked(true);
        saved.setReplacedByHash("new-hash");
        RefreshToken updated = repository.save(saved);

        assertThat(updated.isRevoked()).isTrue();
        assertThat(updated.getUsedAt()).isNotNull();
        assertThat(updated.getReplacedByHash()).isEqualTo("new-hash");
    }

    @Test
    void findByHash_shouldReturnToken() {
        String hash = UUID.randomUUID().toString();
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(hash);
        token.setFamily("family-3");
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        repository.save(token);

        RefreshToken found = repository.findByHash(hash);
        assertThat(found).isNotNull();
        assertThat(found.getTokenHash()).isEqualTo(hash);
    }

    @Test
    void findByHash_notFound_shouldReturnNull() {
        RefreshToken found = repository.findByHash("nonexistent");
        assertThat(found).isNull();
    }

    @Test
    void findById_shouldReturnToken() {
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setFamily("family-4");
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        RefreshToken saved = repository.save(token);

        RefreshToken found = repository.findById(saved.getId());
        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(saved.getId());
    }

    @Test
    void findById_notFound_shouldReturnNull() {
        RefreshToken found = repository.findById(99999);
        assertThat(found).isNull();
    }

    @Test
    void markUsed_shouldUpdateTimestampAndReplacedByHash() {
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setFamily("family-5");
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        RefreshToken saved = repository.save(token);

        repository.markUsed(saved.getId(), "replacement-hash");

        RefreshToken updated = repository.findById(saved.getId());
        assertThat(updated.getUsedAt()).isNotNull();
        assertThat(updated.getReplacedByHash()).isEqualTo("replacement-hash");
    }

    @Test
    void revokeFamily_shouldRevokeAllInFamily() {
        RefreshToken token1 = new RefreshToken();
        token1.setUserId(userId);
        token1.setTokenHash(UUID.randomUUID().toString());
        token1.setFamily("revoke-me");
        token1.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        repository.save(token1);

        RefreshToken token2 = new RefreshToken();
        token2.setUserId(userId);
        token2.setTokenHash(UUID.randomUUID().toString());
        token2.setFamily("revoke-me");
        token2.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        repository.save(token2);

        repository.revokeFamily("revoke-me");

        assertThat(repository.findByHash(token1.getTokenHash()).isRevoked()).isTrue();
        assertThat(repository.findByHash(token2.getTokenHash()).isRevoked()).isTrue();
    }

    @Test
    void revokeAllForUser_shouldRevokeAllUserTokens() {
        RefreshToken token1 = new RefreshToken();
        token1.setUserId(userId);
        token1.setTokenHash(UUID.randomUUID().toString());
        token1.setFamily("keep-me");
        token1.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        repository.save(token1);

        RefreshToken token2 = new RefreshToken();
        token2.setUserId(userId);
        token2.setTokenHash(UUID.randomUUID().toString());
        token2.setFamily("other-family");
        token2.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        repository.save(token2);

        repository.revokeAllForUser(userId);

        assertThat(repository.findByHash(token1.getTokenHash()).isRevoked()).isTrue();
        assertThat(repository.findByHash(token2.getTokenHash()).isRevoked()).isTrue();
    }

    @Test
    void deleteExpired_shouldRemoveExpiredTokens() {
        RefreshToken expired = new RefreshToken();
        expired.setUserId(userId);
        expired.setTokenHash(UUID.randomUUID().toString());
        expired.setFamily("expiring");
        expired.setExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS));
        repository.save(expired);

        RefreshToken valid = new RefreshToken();
        valid.setUserId(userId);
        valid.setTokenHash(UUID.randomUUID().toString());
        valid.setFamily("valid");
        valid.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        repository.save(valid);

        repository.deleteExpired(Instant.now());

        assertThat(repository.findByHash(expired.getTokenHash())).isNull();
        assertThat(repository.findByHash(valid.getTokenHash())).isNotNull();
    }
}
