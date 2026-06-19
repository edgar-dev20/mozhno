package dev.mozhno.flags;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import dev.mozhno.CacheNames;
import dev.mozhno.flags.strategy.FlagStrategy;

import org.springframework.jdbc.support.GeneratedKeyHolder;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * JDBC-based repository for {@link Flag} entities.
 */
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

    /**
     * Returns all non-archived flags for a project.
     *
     * @param projectId the project ID
     * @return list of flags
     */
    public List<Flag> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? AND archived = FALSE ORDER BY id", ROW_MAPPER, projectId);
    }

    /**
     * Returns all flags for a project, including archived ones.
     *
     * @param projectId the project ID
     * @return list of flags
     */
    public List<Flag> findByProjectIdIncludingArchived(Integer projectId) {
        return jdbc.query("SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    /**
     * Returns non-archived flags with their strategy for the given environment.
     *
     * @param projectId the project ID
     * @param environmentId the environment ID
     * @return list of flags paired with their strategies
     */
    public List<FlagWithStrategy> findByProjectIdWithStrategyForEnvironment(Integer projectId, Integer environmentId) {
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
        List<FlagWithStrategy> results = jdbc.query(sql, (rs, _) -> {
            Flag f = mapFlag(rs);
            FlagStrategy s = mapStrategy(rs, environmentId);
            return new FlagWithStrategy(f, s);
        }, environmentId, projectId);

        return enrichSegmentIds(results);
    }

    /**
     * Returns all flags with their strategies across all environments.
     * A flag may appear multiple times in the result — once per environment strategy.
     * The caller is responsible for grouping by flag ID.
     *
     * @param projectId the project ID
     * @return list of flag+strategy pairs for each environment
     */
    public List<FlagWithStrategy> findByProjectIdWithAllEnvironmentStrategies(Integer projectId) {
        String sql = """
            SELECT f.id, f.project_id, f.name, f.flag_key, f.description, f.flag_type, f.created_at, f.creator_id, f.archived_by, f.archived_at, f.enabled as flag_enabled, f.archived,
                   s.id as strategy_id, s.environment_id as strategy_env_id, s.enabled as strategy_enabled, s.percentage,
                   s.context_definition_id,
                   s.context_values_json as context_values,
                   s.last_used_at as strategy_last_used_at,
                   cd.name as context_name,
                   e.name as environment_name
            FROM flags f
            LEFT JOIN flag_strategies s ON f.id = s.flag_id
            LEFT JOIN context_definitions cd ON cd.id = s.context_definition_id
            LEFT JOIN environments e ON e.id = s.environment_id
            WHERE f.project_id = ?
            ORDER BY f.id, s.environment_id
            """;
        List<FlagWithStrategy> results = jdbc.query(sql, (rs, _) -> {
            Flag f = mapFlag(rs);
            FlagStrategy s = mapStrategyWithEnv(rs, rs.getObject("strategy_env_id") != null ? rs.getInt("strategy_env_id") : null);
            return new FlagWithStrategy(f, s);
        }, projectId);

        return enrichSegmentIds(results);
    }

    public List<FlagWithStrategy> findByProjectIdWithAllEnvironmentStrategiesPaginated(Integer projectId, int offset, int limit) {
        String sql = """
            SELECT f.id, f.project_id, f.name, f.flag_key, f.description, f.flag_type, f.created_at, f.creator_id, f.archived_by, f.archived_at, f.enabled as flag_enabled, f.archived,
                   s.id as strategy_id, s.environment_id as strategy_env_id, s.enabled as strategy_enabled, s.percentage,
                   s.context_definition_id, s.context_values_json as context_values, s.last_used_at as strategy_last_used_at,
                   cd.name as context_name, e.name as environment_name
             FROM (SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? ORDER BY id LIMIT ? OFFSET ?) f
            LEFT JOIN flag_strategies s ON f.id = s.flag_id
            LEFT JOIN context_definitions cd ON cd.id = s.context_definition_id
            LEFT JOIN environments e ON e.id = s.environment_id
            ORDER BY f.id, s.environment_id
            """;
        List<FlagWithStrategy> results = jdbc.query(sql, (rs, _) -> {
            Flag f = mapFlag(rs);
            FlagStrategy s = mapStrategyWithEnv(rs, rs.getObject("strategy_env_id") != null ? rs.getInt("strategy_env_id") : null);
            return new FlagWithStrategy(f, s);
        }, projectId, limit, offset);

        return enrichSegmentIds(results);
    }

    private List<FlagWithStrategy> enrichSegmentIds(List<FlagWithStrategy> results) {
        List<Integer> strategyIds = new ArrayList<>();
        for (FlagWithStrategy fws : results) {
            if (fws.strategy() != null) {
                strategyIds.add(fws.strategy().getId());
            }
        }
        Map<Integer, List<Integer>> segmentIdsMap = loadSegmentIdsBatch(strategyIds);
        List<FlagWithStrategy> enriched = new ArrayList<>(results.size());
        for (FlagWithStrategy fws : results) {
            FlagStrategy s = fws.strategy();
            if (s != null) {
                s.setSegmentIds(segmentIdsMap.getOrDefault(s.getId(), Collections.emptyList()));
            }
            enriched.add(fws);
        }
        return enriched;
    }

    private static Flag mapFlag(java.sql.ResultSet rs) throws java.sql.SQLException {
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
        return f;
    }

    private static FlagStrategy mapStrategy(java.sql.ResultSet rs, Integer environmentId) throws java.sql.SQLException {
        Integer strategyId = rs.getObject("strategy_id") != null ? rs.getInt("strategy_id") : null;
        if (strategyId == null) return null;
        FlagStrategy s = new FlagStrategy();
        s.setId(strategyId);
        s.setEnvironmentId(environmentId);
        s.setEnabled(rs.getBoolean("strategy_enabled"));
        s.setPercentage(rs.getObject("percentage") != null ? rs.getDouble("percentage") : null);
        s.setContextDefinitionId(rs.getObject("context_definition_id") != null ? rs.getInt("context_definition_id") : null);
        s.setContextValuesJson(rs.getString("context_values"));
        s.setContextName(rs.getString("context_name"));
        Timestamp lastUsedTs = rs.getTimestamp("strategy_last_used_at");
        s.setLastUsedAt(lastUsedTs != null ? lastUsedTs.toInstant() : null);
        return s;
    }

    private static FlagStrategy mapStrategyWithEnv(java.sql.ResultSet rs, Integer environmentId) throws java.sql.SQLException {
        FlagStrategy s = mapStrategy(rs, environmentId);
        if (s != null) {
            s.setEnvironmentName(rs.getString("environment_name"));
        }
        return s;
    }

    private Map<Integer, List<Integer>> loadSegmentIdsBatch(List<Integer> strategyIds) {
        if (strategyIds == null || strategyIds.isEmpty()) {
            return Collections.emptyMap();
        }
        String placeholders = String.join(",", Collections.nCopies(strategyIds.size(), "?"));
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT strategy_id, segment_id FROM strategy_segments WHERE strategy_id IN (" + placeholders + ") ORDER BY strategy_id, segment_id",
            strategyIds.toArray());
        Map<Integer, List<Integer>> result = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            Integer strategyId = ((Number) row.get("strategy_id")).intValue();
            Integer segmentId = ((Number) row.get("segment_id")).intValue();
            result.computeIfAbsent(strategyId, k -> new ArrayList<>()).add(segmentId);
        }
        return result;
    }

    /**
     * Finds a flag by its ID.
     *
     * @param id the flag ID
     * @return the flag, or null if not found
     */
    public Flag findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Flag findByIdAndProjectId(Integer id, Integer projectId) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE id = ? AND project_id = ?", ROW_MAPPER, id, projectId);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Finds a flag by project ID and key.
     *
     * @param projectId the project ID
     * @param key the flag key
     * @return the flag, or null if not found
     */
    public Flag findByProjectIdAndKey(Integer projectId, String key) {
        try {
            return jdbc.queryForObject("SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? AND flag_key = ?", ROW_MAPPER, projectId, key);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public List<Flag> findByProjectIdAndKeys(Integer projectId, Set<String> keys) {
        if (keys == null || keys.isEmpty()) return List.of();
        String placeholders = keys.stream().map(k -> "?").collect(java.util.stream.Collectors.joining(","));
        Object[] params = new Object[keys.size() + 1];
        params[0] = projectId;
        int i = 1;
        for (String key : keys) params[i++] = key;
        return jdbc.query(
            "SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? AND flag_key IN (" + placeholders + ")",
            ROW_MAPPER, params);
    }

    /**
     * Counts non-archived flags in a project.
     *
     * @param projectId the project ID
     * @return the count of active flags
     */
    public int countActiveByProjectId(Integer projectId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM flags WHERE project_id = ? AND archived = FALSE", Integer.class, projectId);
        return count != null ? count : 0;
    }

    public long countByProjectId(Integer projectId, boolean includeArchived) {
        String sql = includeArchived
            ? "SELECT COUNT(*) FROM flags WHERE project_id = ?"
            : "SELECT COUNT(*) FROM flags WHERE project_id = ? AND archived = FALSE";
        Long count = jdbc.queryForObject(sql, Long.class, projectId);
        return count != null ? count : 0L;
    }

    public List<Flag> findByProjectIdPaginated(Integer projectId, boolean includeArchived, int offset, int limit) {
        String sql = includeArchived
            ? "SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? ORDER BY id LIMIT ? OFFSET ?"
            : "SELECT id, project_id, name, flag_key, description, flag_type, created_at, creator_id, archived_by, archived_at, enabled, archived FROM flags WHERE project_id = ? AND archived = FALSE ORDER BY id LIMIT ? OFFSET ?";
        return jdbc.query(sql, ROW_MAPPER, projectId, limit, offset);
    }

    /**
     * Inserts or updates a flag.
     *
     * @param flag the flag to save
     * @return the saved flag with its ID populated
     */
    @CacheEvict(value = CacheNames.FLAGS, allEntries = true)
    public Flag save(Flag flag) {
        if (flag.getId() == null) {
            Instant createTime = Instant.now();
            GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO flags (project_id, name, flag_key, description, flag_type, created_at, creator_id, enabled, archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    new String[]{"id"});
                ps.setInt(1, flag.getProjectId());
                ps.setString(2, flag.getName());
                ps.setString(3, flag.getKey());
                ps.setString(4, flag.getDescription());
                ps.setString(5, flag.getFlagType() != null ? flag.getFlagType().name() : "RELEASE");
                ps.setTimestamp(6, Timestamp.from(createTime));
                ps.setObject(7, flag.getCreatorId());
                ps.setBoolean(8, flag.isEnabled());
                ps.setBoolean(9, flag.isArchived());
                return ps;
            }, keyHolder);
            flag.setId(keyHolder.getKey().intValue());
            flag.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE flags SET name = ?, description = ?, flag_type = ?, enabled = ? WHERE id = ? AND project_id = ?",
                flag.getName(), flag.getDescription(), flag.getFlagType() != null ? flag.getFlagType().name() : "RELEASE", flag.isEnabled(), flag.getId(), flag.getProjectId());
        }
        return flag;
    }

    /**
     * Deletes a flag by its ID and project ID.
     *
     * @param id the flag ID
     * @param projectId the project ID
     * @return number of deleted rows
     */
    @CacheEvict(value = CacheNames.FLAGS, allEntries = true)
    public int deleteById(Integer id, Integer projectId) {
        return jdbc.update("DELETE FROM flags WHERE id = ? AND project_id = ?", id, projectId);
    }

    /**
     * Sets the archived status of a flag.
     *
     * @param id the flag ID
     * @param archived true to archive, false to unarchive
     * @param archivedBy the ID of the user performing the action
     * @param projectId the project ID
     */
    @CacheEvict(value = CacheNames.FLAGS, allEntries = true)
    public int setArchived(Integer id, boolean archived, Integer archivedBy, Integer projectId) {
        return jdbc.update("UPDATE flags SET archived = ?, archived_by = ?, archived_at = ? WHERE id = ? AND project_id = ?",
            archived, archivedBy, archived ? new Timestamp(System.currentTimeMillis()) : null, id, projectId);
    }

    /**
     * Clears the archived status and metadata from a flag.
     *
     * @param id the flag ID
     * @param projectId the project ID
     */
    @CacheEvict(value = CacheNames.FLAGS, allEntries = true)
    public int clearArchived(Integer id, Integer projectId) {
        return jdbc.update("UPDATE flags SET archived = FALSE, archived_by = NULL, archived_at = NULL WHERE id = ? AND project_id = ?", id, projectId);
    }

}
