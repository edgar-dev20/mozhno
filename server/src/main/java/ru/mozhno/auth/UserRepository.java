package ru.mozhno.auth;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class UserRepository {
    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<User> ROW_MAPPER = (rs, _) -> {
        User u = new User();
        u.setId(rs.getInt("id"));
        u.setEmail(rs.getString("email"));
        u.setPasswordHash(rs.getString("password_hash"));
        u.setName(rs.getString("name"));
        u.setRole(rs.getString("role"));
        u.setStatus(rs.getString("status"));
        u.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        Timestamp lastActive = rs.getTimestamp("last_active_at");
        u.setLastActiveAt(lastActive != null ? lastActive.toInstant() : null);
        return u;
    };

    public User findByEmail(String email) {
        try {
            return jdbc.queryForObject(
                "SELECT id, email, password_hash, name, role, status, created_at, last_active_at FROM users WHERE email = ?",
                ROW_MAPPER, email);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public User findById(Integer id) {
        try {
            return jdbc.queryForObject(
                "SELECT id, email, password_hash, name, role, status, created_at, last_active_at FROM users WHERE id = ?",
                ROW_MAPPER, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public List<User> findAll() {
        return jdbc.query(
            "SELECT id, email, password_hash, name, role, status, created_at, last_active_at FROM users ORDER BY created_at DESC",
            ROW_MAPPER);
    }

    public boolean existsByEmail(String email) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM users WHERE email = ?", Integer.class, email);
        return count != null && count > 0;
    }

    public User save(User user) {
        if (user.getId() == null) {
            jdbc.update(
                "INSERT INTO users (email, password_hash, name, role, status) VALUES (?, ?, ?, ?, ?)",
                user.getEmail(), user.getPasswordHash(), user.getName(), user.getRole(), user.getStatus());
            return findByEmail(user.getEmail());
        } else {
            jdbc.update(
                "UPDATE users SET email = ?, password_hash = ?, name = ?, role = ?, status = ? WHERE id = ?",
                user.getEmail(), user.getPasswordHash(), user.getName(), user.getRole(), user.getStatus(), user.getId());
            return findById(user.getId());
        }
    }

    public void updateStatus(Integer id, String status) {
        jdbc.update("UPDATE users SET status = ? WHERE id = ?", status, id);
    }

    public void updateRole(Integer id, String role) {
        jdbc.update("UPDATE users SET role = ? WHERE id = ?", role, id);
    }

    public void updateLastActive(Integer id) {
        jdbc.update("UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?", id);
    }

    public void delete(Integer id) {
        jdbc.update("DELETE FROM users WHERE id = ?", id);
    }
}