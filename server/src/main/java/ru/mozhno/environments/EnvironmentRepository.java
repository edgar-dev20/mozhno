package ru.mozhno.environments;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class EnvironmentRepository {
    private final JdbcTemplate jdbc;

    public EnvironmentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Environment> ROW_MAPPER = (rs, rowNum) -> {
        Environment e = new Environment();
        e.setId(rs.getInt("id"));
        e.setName(rs.getString("name"));
        e.setDescription(rs.getString("description"));
        e.setProjectId(rs.getInt("project_id"));
        e.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return e;
    };

    public List<Environment> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, name, description, project_id, created_at FROM environments WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    public Environment findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, name, description, project_id, created_at FROM environments WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Environment save(Environment env) {
        if (env.getId() == null) {
            jdbc.update("INSERT INTO environments (name, description, project_id, created_at) VALUES (?, ?, ?, ?)",
                env.getName(), env.getDescription(), env.getProjectId(), Timestamp.from(Instant.now()));
            env.setId(getLastInsertId());
        } else {
            jdbc.update("UPDATE environments SET name = ?, description = ? WHERE id = ?",
                env.getName(), env.getDescription(), env.getId());
        }
        return env;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM environments WHERE id = ?", id);
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}