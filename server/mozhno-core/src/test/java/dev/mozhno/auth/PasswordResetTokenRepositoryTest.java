package dev.mozhno.auth;

import dev.mozhno.BaseIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordResetTokenRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private PasswordResetTokenRepository repository;

    private Integer userId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
            "pwdreset-test@test.com", "$2a$10$hash", "developer", "active");
        userId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class,
            "pwdreset-test@test.com");
    }

    @Test
    void save_insert_shouldCreateAndReturnToken() {
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));

        PasswordResetToken saved = repository.save(token);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getTokenHash()).isEqualTo(token.getTokenHash());
        assertThat(saved.getExpiresAt()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUsedAt()).isNull();
    }

    @Test
    void save_update_shouldUpdateAndReturnToken() {
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        PasswordResetToken saved = repository.save(token);

        saved.setUsedAt(Instant.now());
        PasswordResetToken updated = repository.save(saved);

        assertThat(updated.getUsedAt()).isNotNull();
    }

    @Test
    void findByHash_found_shouldReturnToken() {
        String hash = UUID.randomUUID().toString();
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(userId);
        token.setTokenHash(hash);
        token.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        repository.save(token);

        PasswordResetToken found = repository.findByHash(hash);

        assertThat(found).isNotNull();
        assertThat(found.getTokenHash()).isEqualTo(hash);
        assertThat(found.getUserId()).isEqualTo(userId);
    }

    @Test
    void findByHash_notFound_shouldReturnNull() {
        PasswordResetToken found = repository.findByHash("nonexistent-hash");

        assertThat(found).isNull();
    }

    @Test
    void findById_found_shouldReturnToken() {
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        PasswordResetToken saved = repository.save(token);

        PasswordResetToken found = repository.findById(saved.getId());

        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(saved.getId());
    }

    @Test
    void findById_notFound_shouldReturnNull() {
        PasswordResetToken found = repository.findById(99999);

        assertThat(found).isNull();
    }

    @Test
    void markUsed_shouldSetUsedAtTimestamp() {
        PasswordResetToken token = new PasswordResetToken();
        token.setUserId(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        PasswordResetToken saved = repository.save(token);

        repository.markUsed(saved.getId());

        PasswordResetToken updated = repository.findById(saved.getId());
        assertThat(updated.getUsedAt()).isNotNull();
    }

    @Test
    void markAllUsedForUser_shouldMarkAllUnusedTokens() {
        PasswordResetToken token1 = new PasswordResetToken();
        token1.setUserId(userId);
        token1.setTokenHash(UUID.randomUUID().toString());
        token1.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        repository.save(token1);

        PasswordResetToken token2 = new PasswordResetToken();
        token2.setUserId(userId);
        token2.setTokenHash(UUID.randomUUID().toString());
        token2.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        repository.save(token2);

        repository.markAllUsedForUser(userId);

        assertThat(repository.findByHash(token1.getTokenHash()).getUsedAt()).isNotNull();
        assertThat(repository.findByHash(token2.getTokenHash()).getUsedAt()).isNotNull();
    }

    @Test
    void markAllUsedForUser_shouldNotAffectOtherUsers() {
        jdbcTemplate.update("INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
            "pwdreset-other@test.com", "$2a$10$hash", "viewer", "active");
        Integer otherUserId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class,
            "pwdreset-other@test.com");

        PasswordResetToken token1 = new PasswordResetToken();
        token1.setUserId(userId);
        token1.setTokenHash(UUID.randomUUID().toString());
        token1.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        repository.save(token1);

        PasswordResetToken token2 = new PasswordResetToken();
        token2.setUserId(otherUserId);
        token2.setTokenHash(UUID.randomUUID().toString());
        token2.setExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));
        repository.save(token2);

        repository.markAllUsedForUser(userId);

        assertThat(repository.findByHash(token1.getTokenHash()).getUsedAt()).isNotNull();
        assertThat(repository.findByHash(token2.getTokenHash()).getUsedAt()).isNull();
    }

    @Test
    void deleteExpired_shouldRemoveExpiredTokens() {
        PasswordResetToken expired = new PasswordResetToken();
        expired.setUserId(userId);
        expired.setTokenHash(UUID.randomUUID().toString());
        expired.setExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS));
        repository.save(expired);

        PasswordResetToken valid = new PasswordResetToken();
        valid.setUserId(userId);
        valid.setTokenHash(UUID.randomUUID().toString());
        valid.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        repository.save(valid);

        repository.deleteExpired(Instant.now());

        assertThat(repository.findByHash(expired.getTokenHash())).isNull();
        assertThat(repository.findByHash(valid.getTokenHash())).isNotNull();
    }
}
