package ru.mozhno.contexts;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class ContextDefinitionRepository {
    private final JdbcTemplate jdbc;

    public ContextDefinitionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<ContextDefinition> ROW_MAPPER = (rs, rowNum) -> {
        ContextDefinition c = new ContextDefinition();
        c.setId(rs.getInt("id"));
        c.setName(rs.getString("name"));
        c.setDescription(rs.getString("description"));
        c.setProjectId(rs.getInt("project_id"));
        c.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return c;
    };

    public List<ContextDefinition> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, name, description, project_id, created_at FROM context_definitions WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    public ContextDefinition findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, name, description, project_id, created_at FROM context_definitions WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public ContextDefinition save(ContextDefinition ctx) {
        if (ctx.getId() == null) {
            jdbc.update("INSERT INTO context_definitions (name, description, project_id, created_at) VALUES (?, ?, ?, ?)",
                ctx.getName(), ctx.getDescription(), ctx.getProjectId(), Timestamp.from(Instant.now()));
            ctx.setId(getLastInsertId());
        } else {
            jdbc.update("UPDATE context_definitions SET name = ?, description = ? WHERE id = ?",
                ctx.getName(), ctx.getDescription(), ctx.getId());
        }
        return ctx;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM context_definitions WHERE id = ?", id);
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}