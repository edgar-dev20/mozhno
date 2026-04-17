package dev.mozhno.auth;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;

@Repository
public class PasswordResetTokenRepository {
    private final JdbcTemplate jdbc;

    public PasswordResetTokenRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<PasswordResetToken> ROW_MAPPER = (rs, _) -> {
        PasswordResetToken t = new PasswordResetToken();
        t.setId(rs.getInt("id"));
        t.setUserId(rs.getInt("user_id"));
        t.setTokenHash(rs.getString("token_hash"));
        t.setExpiresAt(rs.getTimestamp("expires_at").toInstant());
        Timestamp usedAt = rs.getTimestamp("used_at");
        t.setUsedAt(usedAt != null ? usedAt.toInstant() : null);
        t.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return t;
    };

    public PasswordResetToken save(PasswordResetToken token) {
        if (token.getId() == null) {
            jdbc.update(
                "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
                token.getUserId(), token.getTokenHash(), Timestamp.from(token.getExpiresAt()));
            return findByHash(token.getTokenHash());
        } else {
            jdbc.update(
                "UPDATE password_reset_tokens SET used_at = ? WHERE id = ?",
                token.getUsedAt() != null ? Timestamp.from(token.getUsedAt()) : null, token.getId());
            return findById(token.getId());
        }
    }

    public PasswordResetToken findByHash(String tokenHash) {
        try {
            return jdbc.queryForObject(
                "SELECT id, user_id, token_hash, expires_at, used_at, created_at FROM password_reset_tokens WHERE token_hash = ?",
                ROW_MAPPER, tokenHash);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public PasswordResetToken findByHashForUpdate(String tokenHash) {
        try {
            return jdbc.queryForObject(
                "SELECT id, user_id, token_hash, expires_at, used_at, created_at FROM password_reset_tokens WHERE token_hash = ? FOR UPDATE",
                ROW_MAPPER, tokenHash);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public PasswordResetToken findById(Integer id) {
        try {
            return jdbc.queryForObject(
                "SELECT id, user_id, token_hash, expires_at, used_at, created_at FROM password_reset_tokens WHERE id = ?",
                ROW_MAPPER, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public void markUsed(Integer id) {
        jdbc.update("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?", id);
    }

    public void markAllUsedForUser(Integer userId) {
        jdbc.update("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL", userId);
    }

    public void deleteExpired(Instant before) {
        jdbc.update("DELETE FROM password_reset_tokens WHERE expires_at < ?", Timestamp.from(before));
    }
}
