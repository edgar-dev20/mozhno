package ru.mozhno.segments;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class SegmentRepository {
    private final JdbcTemplate jdbc;

    public SegmentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Segment> ROW_MAPPER = (rs, rowNum) -> {
        Segment s = new Segment();
        s.setId(rs.getInt("id"));
        s.setProjectId(rs.getInt("project_id"));
        s.setName(rs.getString("name"));
        s.setDescription(rs.getString("description"));
        s.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return s;
    };

    public List<Segment> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, project_id, name, description, created_at FROM segments WHERE project_id = ?", ROW_MAPPER, projectId);
    }

    public Segment findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, description, created_at FROM segments WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Segment save(Segment segment) {
        if (segment.getId() == null) {
            Instant createTime = Instant.now();
            jdbc.update("INSERT INTO segments (project_id, name, description, created_at) VALUES (?, ?, ?, ?)",
                segment.getProjectId(), segment.getName(), segment.getDescription(), Timestamp.from(createTime));
            segment.setId(getLastInsertId());
            segment.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE segments SET name = ?, description = ? WHERE id = ?",
                segment.getName(), segment.getDescription(), segment.getId());
        }
        return segment;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM segments WHERE id = ?", id);
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}