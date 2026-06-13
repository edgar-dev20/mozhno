package dev.mozhno.auth;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;

@Repository
public class InviteTokenRepository {
    private final JdbcTemplate jdbc;

    public InviteTokenRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<InviteToken> ROW_MAPPER = (rs, _) -> {
        InviteToken t = new InviteToken();
        t.setId(rs.getInt("id"));
        t.setEmail(rs.getString("email"));
        t.setRole(rs.getString("role"));
        t.setCreatedBy(rs.getObject("created_by", Integer.class));
        t.setTokenHash(rs.getString("token_hash"));
        t.setExpiresAt(rs.getTimestamp("expires_at").toInstant());
        Timestamp usedAt = rs.getTimestamp("used_at");
        t.setUsedAt(usedAt != null ? usedAt.toInstant() : null);
        t.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return t;
    };

    public InviteToken save(InviteToken token) {
        if (token.getId() == null) {
            jdbc.update(
                "INSERT INTO invite_tokens (email, role, created_by, token_hash, expires_at) VALUES (?, ?, ?, ?, ?)",
                token.getEmail(), token.getRole(), token.getCreatedBy(), token.getTokenHash(),
                Timestamp.from(token.getExpiresAt()));
            return findByHash(token.getTokenHash());
        } else {
            jdbc.update(
                "UPDATE invite_tokens SET used_at = ? WHERE id = ?",
                token.getUsedAt() != null ? Timestamp.from(token.getUsedAt()) : null, token.getId());
            return findById(token.getId());
        }
    }

    public InviteToken findByHash(String tokenHash) {
        try {
            return jdbc.queryForObject(
                "SELECT id, email, role, created_by, token_hash, expires_at, used_at, created_at FROM invite_tokens WHERE token_hash = ?",
                ROW_MAPPER, tokenHash);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public InviteToken findByHashForUpdate(String tokenHash) {
        try {
            return jdbc.queryForObject(
                "SELECT id, email, role, created_by, token_hash, expires_at, used_at, created_at FROM invite_tokens WHERE token_hash = ? FOR UPDATE",
                ROW_MAPPER, tokenHash);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public InviteToken findById(Integer id) {
        try {
            return jdbc.queryForObject(
                "SELECT id, email, role, created_by, token_hash, expires_at, used_at, created_at FROM invite_tokens WHERE id = ?",
                ROW_MAPPER, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public void markUsed(Integer id) {
        jdbc.update("UPDATE invite_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?", id);
    }

    public void deleteExpired(Instant before) {
        jdbc.update("DELETE FROM invite_tokens WHERE expires_at < ?", Timestamp.from(before));
    }
}
