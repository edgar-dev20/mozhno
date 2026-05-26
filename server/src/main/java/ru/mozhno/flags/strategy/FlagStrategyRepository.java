package ru.mozhno.flags.strategy;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.sql.Timestamp;
import java.time.Instant;
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
        fs.setStrategyType(rs.getString("strategy_type"));
        fs.setEnabled(rs.getBoolean("enabled"));
        fs.setPercentage(rs.getDouble("percentage"));
        fs.setRolloutPercentage(rs.getDouble("rollout_percentage"));
        fs.setContextDefinitionId(rs.getObject("context_definition_id") != null ? rs.getInt("context_definition_id") : null);
        fs.setContextValuesJson(rs.getString("context_values_json"));
        fs.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return fs;
    };

    public List<FlagStrategy> findByFlagId(Integer flagId) {
        return jdbc.query("SELECT id, flag_id, environment_id, strategy_type, enabled, percentage, rollout_percentage, context_definition_id, context_values_json, created_at FROM flag_strategies WHERE flag_id = ?", ROW_MAPPER, flagId);
    }

    public FlagStrategy findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, flag_id, environment_id, strategy_type, enabled, percentage, rollout_percentage, context_definition_id, context_values_json, created_at FROM flag_strategies WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public FlagStrategy findByFlagIdAndEnvironmentId(Integer flagId, Integer environmentId) {
        try {
            return jdbc.queryForObject("SELECT id, flag_id, environment_id, strategy_type, enabled, percentage, rollout_percentage, context_definition_id, context_values_json, created_at FROM flag_strategies WHERE flag_id = ? AND environment_id = ?", ROW_MAPPER, flagId, environmentId);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public FlagStrategy save(FlagStrategy fs) {
        if (fs.getId() == null) {
            jdbc.update("INSERT INTO flag_strategies (flag_id, environment_id, strategy_type, enabled, percentage, rollout_percentage, context_definition_id, context_values_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                fs.getFlagId(), fs.getEnvironmentId(), fs.getStrategyType(), fs.isEnabled(),
                fs.getPercentage(), fs.getRolloutPercentage(), fs.getContextDefinitionId(),
                fs.getContextValuesJson(), Timestamp.from(Instant.now()));
            fs.setId(getLastInsertId());
        } else {
            jdbc.update("UPDATE flag_strategies SET environment_id = ?, strategy_type = ?, enabled = ?, percentage = ?, rollout_percentage = ?, context_definition_id = ?, context_values_json = ? WHERE id = ?",
                fs.getEnvironmentId(), fs.getStrategyType(), fs.isEnabled(),
                fs.getPercentage(), fs.getRolloutPercentage(), fs.getContextDefinitionId(),
                fs.getContextValuesJson(), fs.getId());
        }
        return fs;
    }

    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM flag_strategies WHERE id = ?", id);
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}