package dev.mozhno.contexts;

import dev.mozhno.ContextType;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * JDBC-based repository for {@link ContextDefinition} entities.
 */
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
        c.setStrict(rs.getBoolean("is_strict"));
        c.setProjectId(rs.getInt("project_id"));
        c.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return c;
    };

    /**
     * Returns all context definitions for a project.
     *
     * @param projectId the project ID
     * @return list of context definitions
     */
    @Cacheable("contextDefinitions")
    public List<ContextDefinition> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, name, context_key, context_type, description, created_by, is_strict, project_id, created_at FROM context_definitions WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    /**
     * Counts context definitions in a project.
     *
     * @param projectId the project ID
     * @return the context definition count
     */
    public int countByProjectId(Integer projectId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM context_definitions WHERE project_id = ?", Integer.class, projectId);
        return count != null ? count : 0;
    }

    /**
     * Finds a context definition by its ID.
     *
     * @param id the context definition ID
     * @return the context definition, or null if not found
     */
    public ContextDefinition findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, name, context_key, context_type, description, created_by, is_strict, project_id, created_at FROM context_definitions WHERE id = ?", ROW_MAPPER, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public ContextDefinition findByIdAndProjectId(Integer id, Integer projectId) {
        try {
            return jdbc.queryForObject("SELECT id, name, context_key, context_type, description, created_by, is_strict, project_id, created_at FROM context_definitions WHERE id = ? AND project_id = ?", ROW_MAPPER, id, projectId);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Map<Integer, ContextDefinition> findByIds(Set<Integer> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyMap();
        String placeholders = String.join(",", Collections.nCopies(ids.size(), "?"));
        return jdbc.query(
            "SELECT id, name, context_key, context_type, description, created_by, is_strict, project_id, created_at FROM context_definitions WHERE id IN (" + placeholders + ")",
            ROW_MAPPER, ids.toArray())
            .stream().collect(Collectors.toMap(ContextDefinition::getId, Function.identity()));
    }

    /**
     * Inserts or updates a context definition. Auto-generates a key if not provided.
     *
     * @param ctx the context definition to save
     * @return the saved context definition
     */
    @CacheEvict(value = "contextDefinitions", allEntries = true)
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
                type = ContextType.STRING.getValue();
                ctx.setContextType(type);
            }
            final String finalKey = key;
            final String finalType = type;
            Instant createTime = Instant.now();
            GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO context_definitions (name, context_key, context_type, created_by, description, is_strict, project_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    new String[]{"id"});
                ps.setString(1, ctx.getName());
                ps.setString(2, finalKey);
                ps.setString(3, finalType);
                ps.setString(4, ctx.getCreatedBy());
                ps.setString(5, ctx.getDescription());
                ps.setBoolean(6, ctx.isStrict());
                ps.setInt(7, ctx.getProjectId());
                ps.setTimestamp(8, Timestamp.from(createTime));
                return ps;
            }, keyHolder);
            ctx.setId(keyHolder.getKey().intValue());
            ctx.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE context_definitions SET name = ?, context_key = ?, context_type = ?, description = ?, is_strict = ? WHERE id = ? AND project_id = ?",
                ctx.getName(), ctx.getContextKey(), ctx.getContextType(), ctx.getDescription(), ctx.isStrict(), ctx.getId(), ctx.getProjectId());
        }
        return ctx;
    }

    /**
     * Deletes a context definition by its ID and project ID.
     *
     * @param id the context definition ID
     * @param projectId the project ID
     * @return number of deleted rows
     */
    @CacheEvict(value = "contextDefinitions", allEntries = true)
    public int deleteById(Integer id, Integer projectId) {
        return jdbc.update("DELETE FROM context_definitions WHERE id = ? AND project_id = ?", id, projectId);
    }


}
