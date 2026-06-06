package ru.mozhno.tags;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class TagRepository {
    private final JdbcTemplate jdbc;

    public TagRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Tag> ROW_MAPPER = (rs, rowNum) -> {
        Tag t = new Tag();
        t.setId(rs.getInt("id"));
        t.setName(rs.getString("name"));
        t.setDescription(rs.getString("description"));
        t.setColor(rs.getString("color"));
        t.setProjectId(rs.getInt("project_id"));
        t.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return t;
    };

    public List<Tag> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, name, description, color, project_id, created_at FROM tags WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    public Tag findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, name, description, color, project_id, created_at FROM tags WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Tag save(Tag tag) {
        if (tag.getId() == null) {
            Instant createTime = Instant.now();
            jdbc.update("INSERT INTO tags (name, description, color, project_id, created_at) VALUES (?, ?, ?, ?, ?)",
                tag.getName(), tag.getDescription(), tag.getColor(), tag.getProjectId(), Timestamp.from(createTime));
            tag.setId(getLastInsertId());
            tag.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE tags SET name = ?, description = ?, color = ? WHERE id = ?",
                tag.getName(), tag.getDescription(), tag.getColor(), tag.getId());
        }
        return tag;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM tags WHERE id = ?", id);
    }

    public List<Tag> findAllByIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        String placeholders = String.join(",", ids.stream().map(id -> "?").toList());
        return jdbc.query("SELECT id, name, description, color, project_id, created_at FROM tags WHERE id IN (" + placeholders + ")", ROW_MAPPER, ids.toArray());
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}