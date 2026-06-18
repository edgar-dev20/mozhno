package dev.mozhno.audit;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

/**
 * JDBC-based repository for {@link AuditEvent} entities.
 */
@Repository
public class AuditEventRepository {
    private final JdbcTemplate jdbc;

    public AuditEventRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String COLUMNS = "id, project_id, user_id, user_name, user_email, action, resource_type, resource_id, resource_name, details, ip_address, created_at";

    private static final RowMapper<AuditEvent> ROW_MAPPER = (rs, _) -> {
        AuditEvent e = new AuditEvent();
        e.setId(rs.getInt("id"));
        e.setProjectId(rs.getInt("project_id"));
        e.setUserId(rs.getObject("user_id", Integer.class));
        e.setUserName(rs.getString("user_name"));
        e.setUserEmail(rs.getString("user_email"));
        e.setAction(rs.getString("action"));
        e.setResourceType(rs.getString("resource_type"));
        e.setResourceId(rs.getObject("resource_id", Integer.class));
        e.setResourceName(rs.getString("resource_name"));
        e.setDetails(rs.getString("details"));
        e.setIpAddress(rs.getString("ip_address"));
        e.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return e;
    };

    /**
     * Returns the most recent 500 audit events for a project.
     *
     * @param projectId the project ID
     * @return list of audit events
     */
    public List<AuditEvent> findByProjectId(Integer projectId) {
        return jdbc.query(
            "SELECT " + COLUMNS + " FROM audit_log WHERE project_id = ? ORDER BY created_at DESC LIMIT 500",
            ROW_MAPPER, projectId);
    }

    /**
     * Returns audit events for a project with pagination and optional date filtering.
     *
     * @param projectId the project ID
     * @param limit     maximum number of rows to return
     * @param offset    number of rows to skip
     * @param dateFrom  optional start date (inclusive), ISO format (yyyy-MM-dd)
     * @param dateTo    optional end date (exclusive), ISO format (yyyy-MM-dd)
     * @return list of audit events
     */
    public List<AuditEvent> findByProjectId(Integer projectId, int limit, int offset, String dateFrom, String dateTo) {
        StringBuilder sql = new StringBuilder("SELECT " + COLUMNS + " FROM audit_log WHERE project_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(projectId);

        if (dateFrom != null && !dateFrom.isBlank()) {
            sql.append(" AND created_at >= ?");
            params.add(Timestamp.from(LocalDate.parse(dateFrom).atStartOfDay(ZoneOffset.UTC).toInstant()));
        }
        if (dateTo != null && !dateTo.isBlank()) {
            sql.append(" AND created_at < ?");
            params.add(Timestamp.from(LocalDate.parse(dateTo).plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant()));
        }

        sql.append(" ORDER BY created_at DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbc.query(sql.toString(), ROW_MAPPER, params.toArray());
    }

    /**
     * Deletes audit events older than the specified number of days.
     *
     * @param days the retention threshold in days
     * @return the number of deleted rows
     */
    public int deleteOlderThan(int days) {
        return jdbc.update(
            "DELETE FROM audit_log WHERE created_at < CURRENT_TIMESTAMP - (? || ' days')::INTERVAL", days);
    }

    /**
     * Inserts a new audit event.
     *
     * @param event the audit event to save
     * @return the saved event with its generated ID
     */
    public AuditEvent save(AuditEvent event) {
        GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO audit_log (project_id, user_id, user_name, user_email, action, resource_type, resource_id, resource_name, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                new String[]{"id"});
            if (event.getProjectId() != null) ps.setInt(1, event.getProjectId()); else ps.setNull(1, java.sql.Types.INTEGER);
            if (event.getUserId() != null) ps.setInt(2, event.getUserId()); else ps.setNull(2, java.sql.Types.INTEGER);
            ps.setString(3, event.getUserName());
            ps.setString(4, event.getUserEmail());
            ps.setString(5, event.getAction());
            ps.setString(6, event.getResourceType());
            if (event.getResourceId() != null) ps.setInt(7, event.getResourceId()); else ps.setNull(7, java.sql.Types.INTEGER);
            ps.setString(8, event.getResourceName());
            ps.setString(9, event.getDetails());
            ps.setString(10, event.getIpAddress());
            return ps;
        }, keyHolder);
        event.setId(keyHolder.getKey().intValue());
        return event;
    }
}