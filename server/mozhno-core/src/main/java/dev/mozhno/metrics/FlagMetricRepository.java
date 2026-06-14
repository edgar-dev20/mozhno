package dev.mozhno.metrics;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * JDBC-based repository for flag evaluation metrics.
 * Records and retrieves per-hour true/false evaluation counts.
 */
@Repository
public class FlagMetricRepository {
    private final JdbcTemplate jdbc;

    public FlagMetricRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Records a single flag evaluation. Increments the appropriate counter for the current hour.
     *
     * @param projectId the project ID
     * @param flagId the flag ID
     * @param environmentId the environment ID
     * @param enabled whether the evaluation returned true
     * @param clientInstanceId the client instance ID, may be null for aggregated
     */
    public void recordEvaluation(Integer projectId, Integer flagId, Integer environmentId, boolean enabled, Long clientInstanceId) {
        Instant now = Instant.now();
        Instant bucket = now.truncatedTo(ChronoUnit.HOURS);

        if (clientInstanceId == null) {
            jdbc.update("""
                INSERT INTO flag_metrics (project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (flag_id, environment_id, time_bucket) WHERE client_instance_id IS NULL
                DO UPDATE SET
                  evaluation_true_count = flag_metrics.evaluation_true_count + EXCLUDED.evaluation_true_count,
                  evaluation_false_count = flag_metrics.evaluation_false_count + EXCLUDED.evaluation_false_count
                """,
                projectId, flagId, environmentId, enabled ? 1 : 0, enabled ? 0 : 1, Timestamp.from(bucket));
        } else {
            jdbc.update("""
                INSERT INTO flag_metrics (project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket, client_instance_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (flag_id, environment_id, time_bucket, client_instance_id) WHERE client_instance_id IS NOT NULL
                DO UPDATE SET
                  evaluation_true_count = flag_metrics.evaluation_true_count + EXCLUDED.evaluation_true_count,
                  evaluation_false_count = flag_metrics.evaluation_false_count + EXCLUDED.evaluation_false_count
                """,
                projectId, flagId, environmentId, enabled ? 1 : 0, enabled ? 0 : 1, Timestamp.from(bucket), clientInstanceId);
        }
    }

    /**
     * Records multiple flag evaluations in a single insert.
     *
     * @param projectId the project ID
     * @param flagId the flag ID
     * @param environmentId the environment ID
     * @param trueCount number of true evaluations to record
     * @param falseCount number of false evaluations to record
     * @param clientInstanceId the client instance ID, may be null for aggregated
     */
    public void recordEvaluations(Integer projectId, Integer flagId, Integer environmentId, int trueCount, int falseCount, Long clientInstanceId) {
        if (trueCount <= 0 && falseCount <= 0) return;
        Instant now = Instant.now();
        Instant bucket = now.truncatedTo(ChronoUnit.HOURS);

        if (clientInstanceId == null) {
            jdbc.update("""
                INSERT INTO flag_metrics (project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (flag_id, environment_id, time_bucket) WHERE client_instance_id IS NULL
                DO UPDATE SET
                  evaluation_true_count = flag_metrics.evaluation_true_count + EXCLUDED.evaluation_true_count,
                  evaluation_false_count = flag_metrics.evaluation_false_count + EXCLUDED.evaluation_false_count
                """,
                projectId, flagId, environmentId, trueCount, falseCount, Timestamp.from(bucket));
        } else {
            jdbc.update("""
                INSERT INTO flag_metrics (project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket, client_instance_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (flag_id, environment_id, time_bucket, client_instance_id) WHERE client_instance_id IS NOT NULL
                DO UPDATE SET
                  evaluation_true_count = flag_metrics.evaluation_true_count + EXCLUDED.evaluation_true_count,
                  evaluation_false_count = flag_metrics.evaluation_false_count + EXCLUDED.evaluation_false_count
                """,
                projectId, flagId, environmentId, trueCount, falseCount, Timestamp.from(bucket), clientInstanceId);
        }
    }

    /**
     * Records multiple flag evaluations in a single insert (aggregated, no instance).
     *
     * @param projectId the project ID
     * @param flagId the flag ID
     * @param environmentId the environment ID
     * @param trueCount number of true evaluations to record
     */
    public void recordEvaluations(Integer projectId, Integer flagId, Integer environmentId, int trueCount) {
        recordEvaluations(projectId, flagId, environmentId, trueCount, 0, null);
    }

    /**
     * Returns aggregated metrics (summed across all instances) for a specific flag and environment since the given time.
     *
     * @param flagId the flag ID
     * @param environmentId the environment ID
     * @param since the start time for the query range
     * @return list of hourly metrics
     */
    public List<FlagMetric> findByFlagIdAndEnvironmentId(Integer flagId, Integer environmentId, Instant since) {
        String sql = """
            SELECT
              MAX(id) AS id,
              MAX(project_id) AS project_id,
              flag_id,
              environment_id,
              SUM(evaluation_true_count) AS evaluation_true_count,
              SUM(evaluation_false_count) AS evaluation_false_count,
              NULL AS client_instance_id,
              time_bucket,
              MAX(created_at) AS created_at
            FROM flag_metrics
            WHERE flag_id = ? AND environment_id = ? AND time_bucket >= ?
            GROUP BY flag_id, environment_id, time_bucket
            ORDER BY time_bucket ASC
            """;
        return jdbc.query(sql, rowMapper(), flagId, environmentId, Timestamp.from(since));
    }

    /**
     * Returns per-instance metrics for a specific flag, environment, and client instance.
     */
    public List<FlagMetric> findByFlagIdAndEnvironmentIdAndInstanceId(Integer flagId, Integer environmentId, Long instanceId, Instant since) {
        String sql = """
            SELECT id, project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, client_instance_id, time_bucket, created_at
            FROM flag_metrics
            WHERE flag_id = ? AND environment_id = ? AND client_instance_id = ? AND time_bucket >= ?
            ORDER BY time_bucket ASC
            """;
        return jdbc.query(sql, rowMapper(), flagId, environmentId, instanceId, Timestamp.from(since));
    }

    /**
     * Returns per-app metrics aggregated across all instances of the given app_name.
     */
    public List<FlagMetric> findByFlagIdAndEnvironmentIdAndAppName(Integer flagId, Integer environmentId, String appName, Instant since) {
        String sql = """
            SELECT
              MAX(fm.id) AS id,
              MAX(fm.project_id) AS project_id,
              fm.flag_id,
              fm.environment_id,
              SUM(fm.evaluation_true_count) AS evaluation_true_count,
              SUM(fm.evaluation_false_count) AS evaluation_false_count,
              NULL AS client_instance_id,
              fm.time_bucket,
              MAX(fm.created_at) AS created_at
            FROM flag_metrics fm
            JOIN client_instances ci ON fm.client_instance_id = ci.id
            WHERE fm.flag_id = ? AND fm.environment_id = ? AND ci.app_name = ? AND fm.time_bucket >= ?
            GROUP BY fm.flag_id, fm.environment_id, fm.time_bucket
            ORDER BY fm.time_bucket ASC
            """;
        return jdbc.query(sql, rowMapper(), flagId, environmentId, appName, Timestamp.from(since));
    }

    /**
     * Returns metrics for a project and environment since the given time.
     *
     * @param projectId the project ID
     * @param environmentId the environment ID
     * @param since the start time for the query range
     * @return list of hourly metrics
     */
    public List<FlagMetric> findByProjectIdAndEnvironmentId(Integer projectId, Integer environmentId, Instant since) {
        String sql = """
            SELECT id, project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, client_instance_id, time_bucket, created_at
            FROM flag_metrics
            WHERE project_id = ? AND environment_id = ? AND time_bucket >= ?
            ORDER BY time_bucket ASC
            """;
        return jdbc.query(sql, rowMapper(), projectId, environmentId, Timestamp.from(since));
    }

    /**
     * Returns metrics for a project since the given time (all environments).
     *
     * @param projectId the project ID
     * @param since the start time for the query range
     * @return list of hourly metrics
     */
    public List<FlagMetric> findByProjectId(Integer projectId, Instant since) {
        String sql = """
            SELECT id, project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, client_instance_id, time_bucket, created_at
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
            long ci = rs.getLong("client_instance_id");
            if (!rs.wasNull()) {
                m.setClientInstanceId(ci);
            }
            Timestamp tb = rs.getTimestamp("time_bucket");
            m.setTimeBucket(tb != null ? tb.toInstant() : null);
            Timestamp ca = rs.getTimestamp("created_at");
            m.setCreatedAt(ca != null ? ca.toInstant() : null);
            return m;
        };
    }
}
