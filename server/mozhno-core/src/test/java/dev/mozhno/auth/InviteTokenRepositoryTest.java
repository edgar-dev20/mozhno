package dev.mozhno.auth;

import dev.mozhno.BaseIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class InviteTokenRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private InviteTokenRepository repository;

    private Integer userId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
            "invite-test@test.com", "$2a$10$hash", "admin", "active");
        userId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class,
            "invite-test@test.com");
    }

    @Test
    void save_insert_shouldCreateAndReturnToken() {
        InviteToken token = new InviteToken();
        token.setEmail("invitee@test.com");
        token.setRole("editor");
        token.setCreatedBy(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));

        InviteToken saved = repository.save(token);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("invitee@test.com");
        assertThat(saved.getRole()).isEqualTo("editor");
        assertThat(saved.getCreatedBy()).isEqualTo(userId);
        assertThat(saved.getTokenHash()).isEqualTo(token.getTokenHash());
        assertThat(saved.getExpiresAt()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUsedAt()).isNull();
    }

    @Test
    void save_update_shouldUpdateAndReturnToken() {
        InviteToken token = new InviteToken();
        token.setEmail("update-me@test.com");
        token.setRole("viewer");
        token.setCreatedBy(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        InviteToken saved = repository.save(token);

        saved.setUsedAt(Instant.now());
        InviteToken updated = repository.save(saved);

        assertThat(updated.getUsedAt()).isNotNull();
    }

    @Test
    void findByHash_found_shouldReturnToken() {
        String hash = UUID.randomUUID().toString();
        InviteToken token = new InviteToken();
        token.setEmail("findme@test.com");
        token.setRole("developer");
        token.setCreatedBy(userId);
        token.setTokenHash(hash);
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        repository.save(token);

        InviteToken found = repository.findByHash(hash);

        assertThat(found).isNotNull();
        assertThat(found.getTokenHash()).isEqualTo(hash);
        assertThat(found.getEmail()).isEqualTo("findme@test.com");
        assertThat(found.getRole()).isEqualTo("developer");
        assertThat(found.getCreatedBy()).isEqualTo(userId);
    }

    @Test
    void findByHash_notFound_shouldReturnNull() {
        InviteToken found = repository.findByHash("nonexistent-hash");

        assertThat(found).isNull();
    }

    @Test
    void findById_found_shouldReturnToken() {
        InviteToken token = new InviteToken();
        token.setEmail("byid@test.com");
        token.setRole("viewer");
        token.setCreatedBy(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        InviteToken saved = repository.save(token);

        InviteToken found = repository.findById(saved.getId());

        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(saved.getId());
    }

    @Test
    void findById_notFound_shouldReturnNull() {
        InviteToken found = repository.findById(99999);

        assertThat(found).isNull();
    }

    @Test
    void markUsed_shouldSetUsedAtTimestamp() {
        InviteToken token = new InviteToken();
        token.setEmail("markused@test.com");
        token.setRole("editor");
        token.setCreatedBy(userId);
        token.setTokenHash(UUID.randomUUID().toString());
        token.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        InviteToken saved = repository.save(token);

        repository.markUsed(saved.getId());

        InviteToken updated = repository.findById(saved.getId());
        assertThat(updated.getUsedAt()).isNotNull();
    }

    @Test
    void deleteExpired_shouldRemoveExpiredTokens() {
        InviteToken expired = new InviteToken();
        expired.setEmail("expired@test.com");
        expired.setRole("viewer");
        expired.setCreatedBy(userId);
        expired.setTokenHash(UUID.randomUUID().toString());
        expired.setExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS));
        repository.save(expired);

        InviteToken valid = new InviteToken();
        valid.setEmail("valid@test.com");
        valid.setRole("viewer");
        valid.setCreatedBy(userId);
        valid.setTokenHash(UUID.randomUUID().toString());
        valid.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        repository.save(valid);

        repository.deleteExpired(Instant.now());

        assertThat(repository.findByHash(expired.getTokenHash())).isNull();
        assertThat(repository.findByHash(valid.getTokenHash())).isNotNull();
    }
}
