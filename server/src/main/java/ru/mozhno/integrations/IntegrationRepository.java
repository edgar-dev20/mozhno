package ru.mozhno.integrations;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;

@Repository
public class IntegrationRepository {
    private final JdbcTemplate jdbc;

    public IntegrationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Integration> ROW_MAPPER = (rs, _) -> {
        Integration i = new Integration();
        i.setId(rs.getInt("id"));
        i.setProjectId(rs.getInt("project_id"));
        i.setType(rs.getString("type"));
        i.setName(rs.getString("name"));
        i.setEnabled(rs.getBoolean("enabled"));
        i.setConfigJson(rs.getString("config_json"));
        i.setEventSubscriptionsJson(rs.getString("event_subscriptions_json"));
        i.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        i.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
        return i;
    };

    public List<Integration> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT * FROM integrations WHERE project_id = ? ORDER BY created_at DESC",
            ROW_MAPPER, projectId);
    }

    public Integration findById(Integer id) {
        return jdbc.queryForObject("SELECT * FROM integrations WHERE id = ?", ROW_MAPPER, id);
    }

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
                "UPDATE integrations SET type = ?, name = ?, enabled = ?, config_json = ?::jsonb, event_subscriptions_json = ?::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                integration.getType(), integration.getName(), integration.isEnabled(),
                integration.getConfigJson(), integration.getEventSubscriptionsJson(), integration.getId());
        }
        return integration;
    }

    public void delete(Integer id) {
        jdbc.update("DELETE FROM integrations WHERE id = ?", id);
    }
}