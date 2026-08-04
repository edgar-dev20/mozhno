package dev.mozhno.apikeys;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

/**
 * JDBC-based repository for {@link ApiKey} entities.
 */
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
        k.setKeyType(rs.getString("key_type"));
        Timestamp lastUsed = rs.getTimestamp("last_used_at");
        if (lastUsed != null) k.setLastUsedAt(lastUsed.toInstant());
        return k;
    };

    /**
     * Returns all API keys for a project.
     *
     * @param projectId the project ID
     * @return list of API keys
     */
    public List<ApiKey> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, project_id, environment_id, name, description, api_key, created_at, last_used_at, key_type FROM api_keys WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    /**
     * Finds an API key by its internal ID.
     *
     * @param id the API key ID
     * @return the API key, or null if not found
     */
    public ApiKey findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, environment_id, name, description, api_key, created_at, last_used_at, key_type FROM api_keys WHERE id = ?", ROW_MAPPER, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public ApiKey findByIdAndProjectId(Integer id, Integer projectId) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, environment_id, name, description, api_key, created_at, last_used_at, key_type FROM api_keys WHERE id = ? AND project_id = ?", ROW_MAPPER, id, projectId);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Finds an API key by its token string.
     *
     * @param apiKey the API key token
     * @return the API key, or null if not found
     */
    public ApiKey findByApiKey(String apiKey) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, environment_id, name, description, api_key, created_at, last_used_at, key_type FROM api_keys WHERE api_key = ?", ROW_MAPPER, apiKey);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Inserts or updates an API key.
     *
     * @param key the API key to save
     * @return the saved API key
     */
    public ApiKey save(ApiKey key) {
        if (key.getId() == null) {
            Instant createTime = Instant.now();
            GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO api_keys (project_id, environment_id, name, description, api_key, created_at, key_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    new String[]{"id"});
                ps.setInt(1, key.getProjectId());
                ps.setObject(2, key.getEnvironmentId());
                ps.setString(3, key.getName());
                ps.setString(4, key.getDescription());
                ps.setString(5, key.getApiKey());
                ps.setTimestamp(6, Timestamp.from(createTime));
                ps.setString(7, key.getKeyType() != null ? key.getKeyType() : "SERVER");
                return ps;
            }, keyHolder);
            key.setId(keyHolder.getKey().intValue());
            key.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE api_keys SET name = ?, environment_id = ?, description = ? WHERE id = ? AND project_id = ?",
                key.getName(), key.getEnvironmentId(), key.getDescription(), key.getId(), key.getProjectId());
        }
        return key;
    }

    /**
     * Deletes an API key by its ID and project ID.
     *
     * @param id the API key ID
     * @param projectId the project ID
     * @return number of deleted rows
     */
    public int deleteById(Integer id, Integer projectId) {
        return jdbc.update("DELETE FROM api_keys WHERE id = ? AND project_id = ?", id, projectId);
    }

    /**
     * Updates the last-used timestamp of the API key to the current time.
     *
     * @param id the API key ID
     */
    public void updateLastUsed(Integer id) {
        jdbc.update("UPDATE api_keys SET last_used_at = ? WHERE id = ?", new Timestamp(System.currentTimeMillis()), id);
    }

    /**
     * Counts API keys in a project.
     *
     * @param projectId the project ID
     * @return the API key count
     */
    public int countByProjectId(Integer projectId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM api_keys WHERE project_id = ?", Integer.class, projectId);
        return count != null ? count : 0;
    }

    /**
     * Counts API keys linked to a specific environment.
     *
     * @param environmentId the environment ID
     * @param projectId     the project ID
     * @return the API key count
     */
    public int countByEnvironmentId(Integer environmentId, Integer projectId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM api_keys WHERE environment_id = ? AND project_id = ?",
            Integer.class, environmentId, projectId);
        return count != null ? count : 0;
    }

    public void deleteByProjectId(Integer projectId) {
        jdbc.update("DELETE FROM api_keys WHERE project_id = ?", projectId);
    }
}