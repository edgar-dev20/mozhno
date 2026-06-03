package ru.mozhno.settings;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class ProjectSettingsRepository {
    private final JdbcTemplate jdbc;

    public ProjectSettingsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<ProjectSettings> ROW_MAPPER = (rs, _) -> {
        ProjectSettings s = new ProjectSettings();
        s.setId(rs.getInt("id"));
        s.setProjectId(rs.getInt("project_id"));
        s.setRequireMfa(rs.getBoolean("require_mfa"));
        s.setSessionTimeoutHours(rs.getInt("session_timeout_hours"));
        s.setIpWhitelist(rs.getString("ip_whitelist"));
        s.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        s.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
        return s;
    };

    public ProjectSettings findByProjectId(Integer projectId) {
        try {
            return jdbc.queryForObject(
                "SELECT * FROM project_settings WHERE project_id = ?", ROW_MAPPER, projectId);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public ProjectSettings save(ProjectSettings settings) {
        if (settings.getId() == null) {
            jdbc.update(
                "INSERT INTO project_settings (project_id, require_mfa, session_timeout_hours, ip_whitelist) VALUES (?, ?, ?, ?)",
                settings.getProjectId(), settings.isRequireMfa(), settings.getSessionTimeoutHours(), settings.getIpWhitelist());
            return findByProjectId(settings.getProjectId());
        } else {
            jdbc.update(
                "UPDATE project_settings SET require_mfa = ?, session_timeout_hours = ?, ip_whitelist = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                settings.isRequireMfa(), settings.getSessionTimeoutHours(), settings.getIpWhitelist(), settings.getId());
            return findByProjectId(settings.getProjectId());
        }
    }
}