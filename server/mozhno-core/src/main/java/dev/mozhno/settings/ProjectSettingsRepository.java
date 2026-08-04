package dev.mozhno.settings;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

/**
 * JDBC-based repository for {@link ProjectSettings} entities.
 */
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
        s.setAccentColor(rs.getString("accent_color"));
        s.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        s.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
        return s;
    };

    /**
     * Finds settings for a project.
     *
     * @param projectId the project ID
     * @return the project settings, or null if not found
     */
    public ProjectSettings findByProjectId(Integer projectId) {
        try {
            return jdbc.queryForObject(
                "SELECT id, project_id, require_mfa, session_timeout_hours, ip_whitelist, accent_color, created_at, updated_at FROM project_settings WHERE project_id = ?", ROW_MAPPER, projectId);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Inserts or updates project settings.
     *
     * @param settings the settings to save
     * @return the saved settings, re-read from the database
     */
    public ProjectSettings save(ProjectSettings settings) {
        if (settings.getId() == null) {
            jdbc.update(
                "INSERT INTO project_settings (project_id, require_mfa, session_timeout_hours, ip_whitelist, accent_color) VALUES (?, ?, ?, ?, ?)",
                settings.getProjectId(), settings.isRequireMfa(), settings.getSessionTimeoutHours(), settings.getIpWhitelist(), settings.getAccentColor());
            return findByProjectId(settings.getProjectId());
        } else {
            jdbc.update(
                "UPDATE project_settings SET require_mfa = ?, session_timeout_hours = ?, ip_whitelist = ?, accent_color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                settings.isRequireMfa(), settings.getSessionTimeoutHours(), settings.getIpWhitelist(), settings.getAccentColor(), settings.getId());
            return findByProjectId(settings.getProjectId());
        }
    }

    public void deleteByProjectId(Integer projectId) {
        jdbc.update("DELETE FROM project_settings WHERE project_id = ?", projectId);
    }
}