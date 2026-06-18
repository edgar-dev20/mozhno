package dev.mozhno.integrations;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;

/**
 * JDBC-based repository for {@link Integration} entities.
 */
@Repository
public class IntegrationRepository {
    private final JdbcTemplate jdbc;

    public IntegrationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String COLUMNS = "id, project_id, type, name, enabled, config_json, event_subscriptions_json, last_error, created_at, updated_at";

    private static final RowMapper<Integration> ROW_MAPPER = (rs, _) -> {
        Integration i = new Integration();
        i.setId(rs.getInt("id"));
        i.setProjectId(rs.getInt("project_id"));
        i.setType(rs.getString("type"));
        i.setName(rs.getString("name"));
        i.setEnabled(rs.getBoolean("enabled"));
        i.setConfigJson(rs.getString("config_json"));
        i.setEventSubscriptionsJson(rs.getString("event_subscriptions_json"));
        i.setLastError(rs.getString("last_error"));
        i.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        i.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
        return i;
    };

    /**
     * Returns all integrations for a project, ordered by creation date descending.
     *
     * @param projectId the project ID
     * @return list of integrations
     */
    public List<Integration> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT " + COLUMNS + " FROM integrations WHERE project_id = ? ORDER BY created_at DESC",
            ROW_MAPPER, projectId);
    }

    /**
     * Finds an integration by its ID.
     *
     * @param id the integration ID
     * @return the integration, or null if not found
     */
    public Integration findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT " + COLUMNS + " FROM integrations WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Integration findByIdAndProjectId(Integer id, Integer projectId) {
        try {
            return jdbc.queryForObject("SELECT " + COLUMNS + " FROM integrations WHERE id = ? AND project_id = ?", ROW_MAPPER, id, projectId);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Inserts or updates an integration.
     *
     * @param integration the integration to save
     * @return the saved integration
     */
    public Integration save(Integration integration) {
        if (integration.getId() == null) {
            GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO integrations (project_id, type, name, enabled, config_json, event_subscriptions_json) VALUES (?, ?, ?, ?, ?::jsonb, ?::jsonb)",
                    new String[]{"id"});
                ps.setInt(1, integration.getProjectId());
                ps.setString(2, integration.getType());
                ps.setString(3, integration.getName());
                ps.setBoolean(4, integration.isEnabled());
                ps.setString(5, integration.getConfigJson());
                ps.setString(6, integration.getEventSubscriptionsJson());
                return ps;
            }, keyHolder);
            integration.setId(keyHolder.getKey().intValue());
        } else {
            jdbc.update(
                "UPDATE integrations SET type = ?, name = ?, enabled = ?, config_json = ?::jsonb, event_subscriptions_json = ?::jsonb, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND project_id = ?",
                integration.getType(), integration.getName(), integration.isEnabled(),
                integration.getConfigJson(), integration.getEventSubscriptionsJson(), integration.getLastError(), integration.getId(), integration.getProjectId());
        }
        return integration;
    }

    /**
     * Deletes an integration by its ID and project ID.
     *
     * @param id the integration ID
     * @param projectId the project ID
     * @return number of deleted rows
     */
    public int delete(Integer id, Integer projectId) {
        return jdbc.update("DELETE FROM integrations WHERE id = ? AND project_id = ?", id, projectId);
    }
}