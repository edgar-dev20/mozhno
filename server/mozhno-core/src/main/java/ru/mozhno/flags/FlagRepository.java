package ru.mozhno.flags;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import ru.mozhno.flags.strategy.FlagStrategy;

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
        f.setCreatorId(rs.getObject("creator_id") != null ? rs.getInt("creator_id") : null);
        f.setArchivedBy(rs.getObject("archived_by") != null ? rs.getInt("archived_by") : null);
        Timestamp archivedAtTs = rs.getTimestamp("archived_at");
        f.setArchivedAt(archivedAtTs != null ? archivedAtTs.toInstant() : null);
        f.setEnabled(rs.getBoolean("enabled"));
        f.setArchived(rs.getBoolean("archived"));
        return f;
    };

    public List<Flag> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? AND archived = FALSE ORDER BY id", ROW_MAPPER, projectId);
    }

    public List<Flag> findByProjectIdIncludingArchived(Integer projectId) {
        return jdbc.query("SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    public List<Flag> findByProjectIdWithStrategyForEnvironment(Integer projectId, Integer environmentId) {
        String sql = """
            SELECT f.id, f.project_id, f.name, f.flag_key, f.description, f.flag_type, f.created_at, f.creator_id, f.archived_by, f.archived_at, f.enabled as flag_enabled, f.archived,
                   s.id as strategy_id, s.enabled as strategy_enabled, s.percentage,
                   s.context_definition_id,
                   s.context_values_json as context_values,
                   s.last_used_at as strategy_last_used_at,
                   cd.name as context_name
            FROM flags f
            LEFT JOIN flag_strategies s ON f.id = s.flag_id AND s.environment_id = ?
            LEFT JOIN context_definitions cd ON cd.id = s.context_definition_id
            WHERE f.project_id = ? AND f.archived = FALSE
            ORDER BY f.id
            """;
        return jdbc.query(sql, (rs, _) -> {
            Flag f = new Flag();
            f.setId(rs.getInt("id"));
            f.setProjectId(rs.getInt("project_id"));
            f.setName(rs.getString("name"));
            f.setKey(rs.getString("flag_key"));
            f.setDescription(rs.getString("description"));
            f.setFlagType(FlagType.valueOf(rs.getString("flag_type")));
            f.setCreatedAt(rs.getTimestamp("created_at").toInstant());
            f.setCreatorId(rs.getObject("creator_id") != null ? rs.getInt("creator_id") : null);
            f.setArchivedBy(rs.getObject("archived_by") != null ? rs.getInt("archived_by") : null);
            Timestamp archivedAtTs = rs.getTimestamp("archived_at");
            f.setArchivedAt(archivedAtTs != null ? archivedAtTs.toInstant() : null);
            f.setEnabled(rs.getBoolean("flag_enabled"));
            f.setArchived(rs.getBoolean("archived"));

            Integer strategyId = rs.getObject("strategy_id") != null ? rs.getInt("strategy_id") : null;
            if (strategyId != null) {
                FlagStrategy s = new FlagStrategy();
                s.setId(strategyId);
                s.setFlagId(f.getId());
                s.setEnvironmentId(environmentId);
                s.setEnabled(rs.getBoolean("strategy_enabled"));
                s.setPercentage(rs.getObject("percentage") != null ? rs.getDouble("percentage") : null);
                s.setContextDefinitionId(rs.getObject("context_definition_id") != null ? rs.getInt("context_definition_id") : null);
                s.setContextValuesJson(rs.getString("context_values"));
                s.setContextName(rs.getString("context_name"));
                Timestamp lastUsedTs = rs.getTimestamp("strategy_last_used_at");
                s.setLastUsedAt(lastUsedTs != null ? lastUsedTs.toInstant() : null);
                s.setSegmentIds(loadSegmentIds(strategyId));
                f.setStrategy(s);
            }
            return f;
        }, environmentId, projectId);
    }

    private List<Integer> loadSegmentIds(Integer strategyId) {
        return jdbc.queryForList(
            "SELECT segment_id FROM strategy_segments WHERE strategy_id = ? ORDER BY segment_id",
            Integer.class, strategyId);
    }

    public Flag findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Flag findByProjectIdAndKey(Integer projectId, String key) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? AND flag_key = ?", ROW_MAPPER, projectId, key);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public int countActiveByProjectId(Integer projectId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM flags WHERE project_id = ? AND archived = FALSE", Integer.class, projectId);
        return count != null ? count : 0;
    }

    public Flag save(Flag flag) {
        if (flag.getId() == null) {
            Instant createTime = Instant.now();
            jdbc.update("INSERT INTO flags (project_id, name, flag_key, description, flag_type, created_at, creator_id, enabled, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                flag.getProjectId(), flag.getName(), flag.getKey(), flag.getDescription(),
                flag.getFlagType() != null ? flag.getFlagType().name() : "RELEASE", Timestamp.from(createTime),
                flag.getCreatorId(), flag.isEnabled(), flag.isArchived());
            flag.setId(getLastInsertId());
            flag.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE flags SET name = ?, description = ?, flag_type = ?, enabled = ? WHERE id = ?",
                flag.getName(), flag.getDescription(), flag.getFlagType() != null ? flag.getFlagType().name() : "RELEASE", flag.isEnabled(), flag.getId());
        }
        return flag;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM flags WHERE id = ?", id);
    }

    public void setArchived(Integer id, boolean archived, Integer archivedBy) {
        jdbc.update("UPDATE flags SET archived = ?, archived_by = ?, archived_at = ? WHERE id = ?",
            archived, archivedBy, archived ? new Timestamp(System.currentTimeMillis()) : null, id);
    }

    public void clearArchived(Integer id) {
        jdbc.update("UPDATE flags SET archived = FALSE, archived_by = NULL, archived_at = NULL WHERE id = ?", id);
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}