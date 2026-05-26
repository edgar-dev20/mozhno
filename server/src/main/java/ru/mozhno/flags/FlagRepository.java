package ru.mozhno.flags;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class FlagRepository {
    private final JdbcTemplate jdbc;

    public FlagRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Flag> ROW_MAPPER = (rs, rowNum) -> {
        Flag f = new Flag();
        f.setId(rs.getInt("id"));
        f.setProjectId(rs.getInt("project_id"));
        f.setName(rs.getString("name"));
        f.setKey(rs.getString("flag_key"));
        f.setDescription(rs.getString("description"));
        f.setFlagType(FlagType.valueOf(rs.getString("flag_type")));
        f.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return f;
    };

    public List<Flag> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, project_id, name, flag_key, description, flag_type, created_at FROM flags WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    public Flag findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, flag_key, description, flag_type, created_at FROM flags WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Flag findByProjectIdAndKey(Integer projectId, String key) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, flag_key, description, flag_type, created_at FROM flags WHERE project_id = ? AND flag_key = ?", ROW_MAPPER, projectId, key);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Flag save(Flag flag) {
        if (flag.getId() == null) {
            jdbc.update("INSERT INTO flags (project_id, name, flag_key, description, flag_type, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                flag.getProjectId(), flag.getName(), flag.getKey(), flag.getDescription(),
                flag.getFlagType() != null ? flag.getFlagType().name() : "RELEASE", Timestamp.from(Instant.now()));
            flag.setId(getLastInsertId());
        } else {
            jdbc.update("UPDATE flags SET name = ?, description = ?, flag_type = ? WHERE id = ?",
                flag.getName(), flag.getDescription(), flag.getFlagType() != null ? flag.getFlagType().name() : "RELEASE", flag.getId());
        }
        return flag;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM flags WHERE id = ?", id);
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}