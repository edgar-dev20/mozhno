package dev.mozhno.client;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class ClientInstanceRepository {
    private final JdbcTemplate jdbc;

    public ClientInstanceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void upsert(Integer projectId, Integer environmentId, Integer apiKeyId,
                       String appName, String instanceId, String appType, String keyType) {
        jdbc.update("""
            INSERT INTO client_instances (project_id, environment_id, api_key_id, app_name, instance_id, app_type, key_type, first_seen_at, last_seen_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON CONFLICT (project_id, environment_id, app_name, instance_id)
            DO UPDATE SET last_seen_at = NOW(), api_key_id = COALESCE(EXCLUDED.api_key_id, client_instances.api_key_id)
            """,
            projectId, environmentId, apiKeyId, appName, instanceId, appType, keyType);
    }

    public List<ClientInstance> findByProjectId(Integer projectId) {
        String sql = """
            SELECT id, project_id, environment_id, api_key_id, app_name, instance_id, app_type, sdk_version, key_type, first_seen_at, last_seen_at
            FROM client_instances
            WHERE project_id = ?
            ORDER BY last_seen_at DESC
            """;
        return jdbc.query(sql, rowMapper(), projectId);
    }

    public List<ClientInstance> findByProjectIdAndEnvironmentId(Integer projectId, Integer environmentId) {
        String sql = """
            SELECT id, project_id, environment_id, api_key_id, app_name, instance_id, app_type, sdk_version, key_type, first_seen_at, last_seen_at
            FROM client_instances
            WHERE project_id = ? AND environment_id = ?
            ORDER BY last_seen_at DESC
            """;
        return jdbc.query(sql, rowMapper(), projectId, environmentId);
    }

    private static org.springframework.jdbc.core.RowMapper<ClientInstance> rowMapper() {
        return (rs, _) -> {
            ClientInstance ci = new ClientInstance();
            ci.setId(rs.getLong("id"));
            ci.setProjectId(rs.getInt("project_id"));
            ci.setEnvironmentId(rs.getInt("environment_id"));
            ci.setApiKeyId(rs.getObject("api_key_id", Integer.class));
            ci.setAppName(rs.getString("app_name"));
            ci.setInstanceId(rs.getString("instance_id"));
            ci.setAppType(rs.getString("app_type"));
            ci.setSdkVersion(rs.getString("sdk_version"));
            ci.setKeyType(rs.getString("key_type"));
            Timestamp f = rs.getTimestamp("first_seen_at");
            ci.setFirstSeenAt(f != null ? f.toInstant() : null);
            Timestamp l = rs.getTimestamp("last_seen_at");
            ci.setLastSeenAt(l != null ? l.toInstant() : null);
            return ci;
        };
    }
}
