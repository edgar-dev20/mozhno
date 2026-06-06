package ru.mozhno.metrics;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Repository
public class FlagMetricRepository {
    private final JdbcTemplate jdbc;

    public FlagMetricRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void recordEvaluation(Integer projectId, Integer flagId, Integer environmentId, boolean enabled) {
        Instant now = Instant.now();
        Instant bucket = now.truncatedTo(ChronoUnit.HOURS);

        jdbc.update("""
            INSERT INTO flag_metrics (project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (flag_id, environment_id, time_bucket)
            DO UPDATE SET
              evaluation_true_count = flag_metrics.evaluation_true_count + EXCLUDED.evaluation_true_count,
              evaluation_false_count = flag_metrics.evaluation_false_count + EXCLUDED.evaluation_false_count
            """,
            projectId, flagId, environmentId, enabled ? 1 : 0, enabled ? 0 : 1, Timestamp.from(bucket));
    }

    public List<FlagMetric> findByFlagIdAndEnvironmentId(Integer flagId, Integer environmentId, Instant since) {
        String sql = """
            SELECT id, project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket, created_at
            FROM flag_metrics
            WHERE flag_id = ? AND environment_id = ? AND time_bucket >= ?
            ORDER BY time_bucket ASC
            """;
        return jdbc.query(sql, rowMapper(), flagId, environmentId, Timestamp.from(since));
    }

    public List<FlagMetric> findByProjectIdAndEnvironmentId(Integer projectId, Integer environmentId, Instant since) {
        String sql = """
            SELECT id, project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket, created_at
            FROM flag_metrics
            WHERE project_id = ? AND environment_id = ? AND time_bucket >= ?
            ORDER BY time_bucket ASC
            """;
        return jdbc.query(sql, rowMapper(), projectId, environmentId, Timestamp.from(since));
    }

    public List<FlagMetric> findByProjectId(Integer projectId, Instant since) {
        String sql = """
            SELECT id, project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket, created_at
            FROM flag_metrics
            WHERE project_id = ? AND time_bucket >= ?
            ORDER BY time_bucket ASC
            """;
        return jdbc.query(sql, rowMapper(), projectId, Timestamp.from(since));
    }

    private static org.springframework.jdbc.core.RowMapper<FlagMetric> rowMapper() {
        return (rs, _) -> {
            FlagMetric m = new FlagMetric();
            m.setId(rs.getLong("id"));
            m.setProjectId(rs.getInt("project_id"));
            m.setFlagId(rs.getInt("flag_id"));
            m.setEnvironmentId(rs.getInt("environment_id"));
            m.setEvaluationTrueCount(rs.getLong("evaluation_true_count"));
            m.setEvaluationFalseCount(rs.getLong("evaluation_false_count"));
            Timestamp tb = rs.getTimestamp("time_bucket");
            m.setTimeBucket(tb != null ? tb.toInstant() : null);
            Timestamp ca = rs.getTimestamp("created_at");
            m.setCreatedAt(ca != null ? ca.toInstant() : null);
            return m;
        };
    }
}
