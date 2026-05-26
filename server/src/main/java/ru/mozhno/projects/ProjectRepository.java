package ru.mozhno.projects;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class ProjectRepository {
    private final JdbcTemplate jdbc;

    public ProjectRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Project> ROW_MAPPER = (rs, rowNum) -> {
        Project p = new Project();
        p.setId(rs.getInt("id"));
        p.setName(rs.getString("name"));
        p.setDescription(rs.getString("description"));
        p.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return p;
    };

    public List<Project> findAll() {
        return jdbc.query("SELECT id, name, description, created_at FROM projects ORDER BY id", ROW_MAPPER);
    }

    public Project findById(Integer id) {
        return jdbc.queryForObject("SELECT id, name, description, created_at FROM projects WHERE id = ?", ROW_MAPPER, id);
    }

    public Project save(Project project) {
        if (project.getId() == null) {
            jdbc.update("INSERT INTO projects (name, description, created_at) VALUES (?, ?, ?)",
                project.getName(), project.getDescription(), Timestamp.from(Instant.now()));
            project.setId(getLastInsertId());
        } else {
            jdbc.update("UPDATE projects SET name = ?, description = ? WHERE id = ?",
                project.getName(), project.getDescription(), project.getId());
        }
        return project;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM projects WHERE id = ?", id);
    }

    public boolean existsById(Integer id) {
        return jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM projects WHERE id = ?)", Boolean.class, id);
    }

    public int count() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM projects", Integer.class);
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}