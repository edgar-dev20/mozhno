package ru.mozhno.contexts;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

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

    public List<ContextValue> findByContextDefinitionId(Integer ctxDefId) {
        return jdbc.query("SELECT id, context_definition_id, context_values, created_at FROM context_values WHERE context_definition_id = ?", ROW_MAPPER, ctxDefId);
    }

    public ContextValue findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, context_definition_id, context_values, created_at FROM context_values WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public ContextValue save(ContextValue cv) {
        if (cv.getId() == null) {
            jdbc.update("INSERT INTO context_values (context_definition_id, context_values, created_at) VALUES (?, ?, ?)",
                cv.getContextDefinitionId(), cv.getValues(), Timestamp.from(Instant.now()));
            cv.setId(getLastInsertId());
        }
        return cv;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM context_values WHERE id = ?", id);
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}