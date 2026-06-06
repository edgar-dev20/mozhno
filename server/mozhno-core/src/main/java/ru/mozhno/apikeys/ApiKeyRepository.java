package ru.mozhno.apikeys;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class ApiKeyRepository {
    private final JdbcTemplate jdbc;

    public ApiKeyRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<ApiKey> ROW_MAPPER = (rs, rowNum) -> {
        ApiKey k = new ApiKey();
        k.setId(rs.getInt("id"));
        k.setProjectId(rs.getInt("project_id"));
        Object envId = rs.getObject("environment_id");
        if (envId != null) k.setEnvironmentId((Integer) envId);
        k.setName(rs.getString("name"));
        k.setDescription(rs.getString("description"));
        k.setApiKey(rs.getString("api_key"));
        k.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        Timestamp lastUsed = rs.getTimestamp("last_used_at");
        if (lastUsed != null) k.setLastUsedAt(lastUsed.toInstant());
        return k;
    };

    public List<ApiKey> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, project_id, environment_id, name, description, api_key, created_at, last_used_at FROM api_keys WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    public ApiKey findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, environment_id, name, description, api_key, created_at, last_used_at FROM api_keys WHERE id = ?", ROW_MAPPER, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public ApiKey findByApiKey(String apiKey) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, environment_id, name, description, api_key, created_at, last_used_at FROM api_keys WHERE api_key = ?", ROW_MAPPER, apiKey);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public ApiKey save(ApiKey key) {
        if (key.getId() == null) {
            Instant createTime = Instant.now();
            jdbc.update("INSERT INTO api_keys (project_id, environment_id, name, description, api_key, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                key.getProjectId(), key.getEnvironmentId(), key.getName(), key.getDescription(),
                key.getApiKey(), Timestamp.from(createTime));
            key.setId(getLastInsertId());
            key.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE api_keys SET name = ?, environment_id = ?, description = ? WHERE id = ?",
                key.getName(), key.getEnvironmentId(), key.getDescription(), key.getId());
        }
        return key;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM api_keys WHERE id = ?", id);
    }

    public void updateLastUsed(Integer id) {
        jdbc.update("UPDATE api_keys SET last_used_at = ? WHERE id = ?", new Timestamp(System.currentTimeMillis()), id);
    }

    public int countByProjectId(Integer projectId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM api_keys WHERE project_id = ?", Integer.class, projectId);
        return count != null ? count : 0;
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}