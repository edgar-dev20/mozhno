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
        c.setContextKey(rs.getString("context_key"));
        c.setContextType(rs.getString("context_type"));
        c.setCreatedBy(rs.getString("created_by"));
        c.setDescription(rs.getString("description"));
        c.setProjectId(rs.getInt("project_id"));
        c.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return c;
    };

    public List<ContextDefinition> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, name, context_key, context_type, description, created_by, project_id, created_at FROM context_definitions WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    public int countByProjectId(Integer projectId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM context_definitions WHERE project_id = ?", Integer.class, projectId);
        return count != null ? count : 0;
    }

    public ContextDefinition findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, name, context_key, context_type, description, created_by, project_id, created_at FROM context_definitions WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public ContextDefinition save(ContextDefinition ctx) {
        if (ctx.getId() == null) {
            String key = ctx.getContextKey();
            if (key == null || key.isBlank()) {
                key = ctx.getName() != null ? ctx.getName().toLowerCase().replaceAll("[^a-z0-9_]", "_") : "ctx";
                if (key.isBlank()) key = "ctx";
                key = key + "_" + System.currentTimeMillis() % 100000;
                ctx.setContextKey(key);
            }
            String type = ctx.getContextType();
            if (type == null || type.isBlank()) {
                type = "string";
                ctx.setContextType(type);
            }
            Instant createTime = Instant.now();
            jdbc.update("INSERT INTO context_definitions (name, context_key, context_type, created_by, description, project_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                ctx.getName(), key, type, ctx.getCreatedBy(), ctx.getDescription(), ctx.getProjectId(), Timestamp.from(createTime));
            ctx.setId(getLastInsertId());
            ctx.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE context_definitions SET name = ?, context_key = ?, context_type = ?, description = ? WHERE id = ?",
                ctx.getName(), ctx.getContextKey(), ctx.getContextType(), ctx.getDescription(), ctx.getId());
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
