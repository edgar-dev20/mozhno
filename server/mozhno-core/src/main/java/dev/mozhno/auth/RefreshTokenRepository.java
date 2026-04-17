package dev.mozhno.auth;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

/**
 * JDBC-based repository for refresh token persistence.
 *
 * <p>Supports token family revocation (for theft detection), per-user revocation
 * (on password change or logout), and cleanup of expired tokens.</p>
 */
@Repository
public class RefreshTokenRepository {
    private final JdbcTemplate jdbc;

    public RefreshTokenRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<RefreshToken> ROW_MAPPER = (rs, _) -> {
        RefreshToken t = new RefreshToken();
        t.setId(rs.getInt("id"));
        t.setUserId(rs.getInt("user_id"));
        t.setTokenHash(rs.getString("token_hash"));
        t.setFamily(rs.getString("family"));
        t.setExpiresAt(rs.getTimestamp("expires_at").toInstant());
        Timestamp usedAt = rs.getTimestamp("used_at");
        t.setUsedAt(usedAt != null ? usedAt.toInstant() : null);
        t.setRevoked(rs.getBoolean("revoked"));
        t.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        t.setReplacedByHash(rs.getString("replaced_by_hash"));
        return t;
    };

    public RefreshToken save(RefreshToken token) {
        if (token.getId() == null) {
            jdbc.update(
                "INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at, revoked) VALUES (?, ?, ?, ?, ?)",
                token.getUserId(), token.getTokenHash(), token.getFamily(),
                Timestamp.from(token.getExpiresAt()), token.isRevoked());
            return findByHash(token.getTokenHash());
        } else {
            jdbc.update(
                "UPDATE refresh_tokens SET used_at = ?, revoked = ?, replaced_by_hash = ? WHERE id = ?",
                token.getUsedAt() != null ? Timestamp.from(token.getUsedAt()) : null,
                token.isRevoked(), token.getReplacedByHash(), token.getId());
            return findById(token.getId());
        }
    }

    public RefreshToken findByHash(String tokenHash) {
        try {
            return jdbc.queryForObject(
                "SELECT id, user_id, token_hash, family, expires_at, used_at, revoked, created_at, replaced_by_hash FROM refresh_tokens WHERE token_hash = ?",
                ROW_MAPPER, tokenHash);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public RefreshToken findByHashForUpdate(String tokenHash) {
        try {
            return jdbc.queryForObject(
                "SELECT id, user_id, token_hash, family, expires_at, used_at, revoked, created_at, replaced_by_hash FROM refresh_tokens WHERE token_hash = ? FOR UPDATE",
                ROW_MAPPER, tokenHash);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public RefreshToken findById(Integer id) {
        try {
            return jdbc.queryForObject(
                "SELECT id, user_id, token_hash, family, expires_at, used_at, revoked, created_at, replaced_by_hash FROM refresh_tokens WHERE id = ?",
                ROW_MAPPER, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public void markUsed(Integer id, String replacedByHash) {
        jdbc.update(
            "UPDATE refresh_tokens SET used_at = CURRENT_TIMESTAMP, replaced_by_hash = ? WHERE id = ?",
            replacedByHash, id);
    }

    public void revokeFamily(String family) {
        jdbc.update(
            "UPDATE refresh_tokens SET revoked = TRUE WHERE family = ? AND revoked = FALSE",
            family);
    }

    public void revokeAllForUser(Integer userId) {
        jdbc.update(
            "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ? AND revoked = FALSE",
            userId);
    }

    public void deleteExpired(Instant before) {
        jdbc.update("DELETE FROM refresh_tokens WHERE expires_at < ?", Timestamp.from(before));
    }
}
