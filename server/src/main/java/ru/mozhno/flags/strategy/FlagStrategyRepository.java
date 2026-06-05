package ru.mozhno.flags.strategy;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Repository
public class FlagStrategyRepository {
    private final JdbcTemplate jdbc;

    public FlagStrategyRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<FlagStrategy> ROW_MAPPER = (rs, rowNum) -> {
        FlagStrategy fs = new FlagStrategy();
        fs.setId(rs.getInt("id"));
        fs.setFlagId(rs.getInt("flag_id"));
        fs.setEnvironmentId(rs.getInt("environment_id"));
        fs.setEnabled(rs.getBoolean("enabled"));
        fs.setPercentage(rs.getObject("percentage") != null ? rs.getDouble("percentage") : null);
        fs.setContextDefinitionId(rs.getObject("context_definition_id") != null ? rs.getInt("context_definition_id") : null);
        fs.setContextValuesJson(rs.getString("context_values_json"));
        fs.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        Timestamp lastUsedTs = rs.getTimestamp("last_used_at");
        fs.setLastUsedAt(lastUsedTs != null ? lastUsedTs.toInstant() : null);
        return fs;
    };

    public List<FlagStrategy> findByFlagId(Integer flagId) {
        List<FlagStrategy> strategies = jdbc.query(
            "SELECT id, flag_id, environment_id, enabled, percentage, context_definition_id, context_values_json, created_at, last_used_at FROM flag_strategies WHERE flag_id = ?",
            ROW_MAPPER, flagId);
        for (FlagStrategy fs : strategies) {
            fs.setSegmentIds(findSegmentIds(fs.getId()));
        }
        return strategies;
    }

    public FlagStrategy findById(Integer id) {
        try {
            FlagStrategy fs = jdbc.queryForObject(
                "SELECT id, flag_id, environment_id, enabled, percentage, context_definition_id, context_values_json, created_at, last_used_at FROM flag_strategies WHERE id = ?",
                ROW_MAPPER, id);
            if (fs != null) {
                fs.setSegmentIds(findSegmentIds(fs.getId()));
            }
            return fs;
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public FlagStrategy findByFlagIdAndEnvironmentId(Integer flagId, Integer environmentId) {
        try {
            FlagStrategy fs = jdbc.queryForObject(
                "SELECT id, flag_id, environment_id, enabled, percentage, context_definition_id, context_values_json, created_at, last_used_at FROM flag_strategies WHERE flag_id = ? AND environment_id = ?",
                ROW_MAPPER, flagId, environmentId);
            if (fs != null) {
                fs.setSegmentIds(findSegmentIds(fs.getId()));
            }
            return fs;
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public FlagStrategy upsert(Integer flagId, Integer environmentId, boolean enabled, Double percentage,
                                Integer contextDefinitionId, String contextValuesJson, List<Integer> segmentIds) {
        String sql = """
            INSERT INTO flag_strategies (flag_id, environment_id, enabled, percentage, context_definition_id, context_values_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
            ON CONFLICT (flag_id, environment_id)
            DO UPDATE SET enabled = EXCLUDED.enabled,
                          percentage = EXCLUDED.percentage,
                          context_definition_id = EXCLUDED.context_definition_id,
                          context_values_json = EXCLUDED.context_values_json,
                          created_at = flag_strategies.created_at
            RETURNING id, flag_id, environment_id, enabled, percentage, context_definition_id, context_values_json, created_at, last_used_at
            """;
        FlagStrategy fs = jdbc.queryForObject(sql, ROW_MAPPER,
            flagId, environmentId, enabled, percentage, contextDefinitionId, contextValuesJson);
        if (fs != null) {
            syncSegmentIds(fs.getId(), segmentIds);
            fs.setSegmentIds(segmentIds != null ? segmentIds : Collections.emptyList());
        }
        return fs;
    }

    public FlagStrategy updateById(Integer id, boolean enabled, Double percentage,
                                    Integer contextDefinitionId, String contextValuesJson, List<Integer> segmentIds) {
        try {
            FlagStrategy fs = jdbc.queryForObject(
                "UPDATE flag_strategies SET enabled = ?, percentage = ?, context_definition_id = ?, context_values_json = ? WHERE id = ? RETURNING id, flag_id, environment_id, enabled, percentage, context_definition_id, context_values_json, created_at, last_used_at",
                ROW_MAPPER, enabled, percentage, contextDefinitionId, contextValuesJson, id);
            if (fs != null) {
                syncSegmentIds(id, segmentIds);
                fs.setSegmentIds(segmentIds != null ? segmentIds : Collections.emptyList());
            }
            return fs;
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public FlagStrategy save(FlagStrategy fs) {
        if (fs.getId() == null) {
            Instant createTime = Instant.now();
            jdbc.update("INSERT INTO flag_strategies (flag_id, environment_id, enabled, percentage, context_definition_id, context_values_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                fs.getFlagId(), fs.getEnvironmentId(), fs.isEnabled(),
                fs.getPercentage(), fs.getContextDefinitionId(),
                fs.getContextValuesJson(), Timestamp.from(createTime));
            fs.setId(getLastInsertId());
            fs.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE flag_strategies SET environment_id = ?, enabled = ?, percentage = ?, context_definition_id = ?, context_values_json = ? WHERE id = ?",
                fs.getEnvironmentId(), fs.isEnabled(),
                fs.getPercentage(), fs.getContextDefinitionId(),
                fs.getContextValuesJson(), fs.getId());
        }
        syncSegmentIds(fs.getId(), fs.getSegmentIds());
        fs.setSegmentIds(fs.getSegmentIds() != null ? fs.getSegmentIds() : Collections.emptyList());
        return fs;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM flag_strategies WHERE id = ?", id);
    }

    public void touchLastUsedAt(List<Integer> strategyIds) {
        if (strategyIds == null || strategyIds.isEmpty()) return;
        String placeholders = strategyIds.stream().map(id -> "?").reduce((a, b) -> a + "," + b).orElse("");
        jdbc.update("UPDATE flag_strategies SET last_used_at = NOW() WHERE id IN (" + placeholders + ")",
            strategyIds.toArray());
    }

    private List<Integer> findSegmentIds(Integer strategyId) {
        return jdbc.queryForList(
            "SELECT segment_id FROM strategy_segments WHERE strategy_id = ? ORDER BY segment_id",
            Integer.class, strategyId);
    }

    private void syncSegmentIds(Integer strategyId, List<Integer> segmentIds) {
        jdbc.update("DELETE FROM strategy_segments WHERE strategy_id = ?", strategyId);
        if (segmentIds != null) {
            for (Integer segId : segmentIds) {
                jdbc.update("INSERT INTO strategy_segments (strategy_id, segment_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
                    strategyId, segId);
            }
        }
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}