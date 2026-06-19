package dev.mozhno.contexts;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * JDBC-based repository for {@link ContextValue} entities.
 */
@Repository
public class ContextValueRepository {
    private final JdbcTemplate jdbc;

    public ContextValueRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<ContextValue> ROW_MAPPER = (rs, rowNum) -> {
        ContextValue cv = new ContextValue();
        cv.setId(rs.getInt("id"));
        cv.setContextDefinitionId(rs.getInt("context_definition_id"));
        cv.setValues(rs.getString("context_values"));
        cv.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return cv;
    };

    /**
     * Returns all values for a given context definition.
     *
     * @param ctxDefId the context definition ID
     * @return list of context values
     */
    public List<ContextValue> findByContextDefinitionId(Integer ctxDefId) {
        return jdbc.query("SELECT id, context_definition_id, context_values, created_at FROM context_values WHERE context_definition_id = ?", ROW_MAPPER, ctxDefId);
    }

    /**
     * Finds a context value by its ID.
     *
     * @param id the context value ID
     * @return the context value, or null if not found
     */
    public ContextValue findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, context_definition_id, context_values, created_at FROM context_values WHERE id = ?", ROW_MAPPER, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Inserts or updates a context value.
     *
     * @param cv the context value to save
     * @return the saved context value
     */
    public ContextValue save(ContextValue cv) {
        if (cv.getId() == null) {
            Instant createTime = Instant.now();
            GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO context_values (context_definition_id, context_values, created_at) VALUES (?, ?, ?)",
                    new String[]{"id"});
                ps.setInt(1, cv.getContextDefinitionId());
                ps.setString(2, cv.getValues());
                ps.setTimestamp(3, Timestamp.from(createTime));
                return ps;
            }, keyHolder);
            cv.setId(keyHolder.getKey().intValue());
            cv.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE context_values SET context_definition_id = ?, context_values = ? WHERE id = ?",
                cv.getContextDefinitionId(), cv.getValues(), cv.getId());
        }
        return cv;
    }

    /**
     * Deletes a context value by its ID.
     *
     * @param id the context value ID
     */
    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM context_values WHERE id = ?", id);
    }

    /**
     * Deletes all context values for a given definition.
     *
     * @param definitionId the context definition ID
     */
    public void deleteByDefinitionId(Integer definitionId) {
        jdbc.update("DELETE FROM context_values WHERE context_definition_id = ?", definitionId);
    }

    /**
     * Returns all context values for the given definition IDs, grouped by definition ID.
     *
     * @param definitionIds set of context definition IDs
     * @return map of definition ID -> list of comma-separated value strings
     */
    public Map<Integer, List<String>> findValuesByDefinitionIds(Set<Integer> definitionIds) {
        if (definitionIds == null || definitionIds.isEmpty()) return Collections.emptyMap();
        String placeholders = String.join(",", Collections.nCopies(definitionIds.size(), "?"));
        List<ContextValue> rows = jdbc.query(
            "SELECT id, context_definition_id, context_values, created_at FROM context_values WHERE context_definition_id IN (" + placeholders + ") ORDER BY context_definition_id, id",
            ROW_MAPPER, definitionIds.toArray());
        Map<Integer, List<String>> result = new LinkedHashMap<>();
        for (ContextValue cv : rows) {
            if (cv.getValues() == null || cv.getValues().isBlank()) continue;
            String[] parts = cv.getValues().split("\\s*,\\s*");
            for (String part : parts) {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    result.computeIfAbsent(cv.getContextDefinitionId(), k -> new ArrayList<>()).add(trimmed);
                }
            }
        }
        return result;
    }


}
