package dev.mozhno.segments;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;
import dev.mozhno.CacheNames;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

/**
 * JDBC-based repository for {@link Segment} entities.
 */
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
        s.setIcon(rs.getString("icon"));
        s.setColor(rs.getString("color"));
        s.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return s;
    };

    /**
     * Returns all segments for a project.
     *
     * @param projectId the project ID
     * @return list of segments
     */
    public List<Segment> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, project_id, name, description, icon, color, created_at FROM segments WHERE project_id = ?", ROW_MAPPER, projectId);
    }

    /**
     * Counts segments in a project.
     *
     * @param projectId the project ID
     * @return the segment count
     */
    public int countByProjectId(Integer projectId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM segments WHERE project_id = ?", Integer.class, projectId);
        return count != null ? count : 0;
    }

    /**
     * Finds a segment by its ID.
     *
     * @param id the segment ID
     * @return the segment, or null if not found
     */
    public Segment findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, description, icon, color, created_at FROM segments WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Segment findByIdAndProjectId(Integer id, Integer projectId) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, description, icon, color, created_at FROM segments WHERE id = ? AND project_id = ?", ROW_MAPPER, id, projectId);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Inserts or updates a segment.
     *
     * @param segment the segment to save
     * @return the saved segment
     */
    @CacheEvict(value = CacheNames.SEGMENTS, allEntries = true)
    public Segment save(Segment segment) {
        if (segment.getId() == null) {
            Instant createTime = Instant.now();
            GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO segments (project_id, name, description, icon, color, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    new String[]{"id"});
                ps.setInt(1, segment.getProjectId());
                ps.setString(2, segment.getName());
                ps.setString(3, segment.getDescription());
                ps.setString(4, segment.getIcon());
                ps.setString(5, segment.getColor());
                ps.setTimestamp(6, Timestamp.from(createTime));
                return ps;
            }, keyHolder);
            segment.setId(keyHolder.getKey().intValue());
            segment.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE segments SET name = ?, description = ?, icon = ?, color = ? WHERE id = ? AND project_id = ?",
                segment.getName(), segment.getDescription(),
                segment.getIcon(),
                segment.getColor(),
                segment.getId(), segment.getProjectId());
        }
        return segment;
    }

    /**
     * Deletes a segment by its ID and project ID.
     *
     * @param id the segment ID
     * @param projectId the project ID
     * @return number of deleted rows
     */
    @CacheEvict(value = CacheNames.SEGMENTS, allEntries = true)
    public int deleteById(Integer id, Integer projectId) {
        return jdbc.update("DELETE FROM segments WHERE id = ? AND project_id = ?", id, projectId);
    }

    public void deleteByProjectId(Integer projectId) {
        jdbc.update("DELETE FROM segments WHERE project_id = ?", projectId);
    }
}