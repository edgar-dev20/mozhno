package dev.mozhno.segments;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

/**
 * JDBC-based repository for {@link SegmentContext} entities.
 */
@Repository
public class SegmentContextRepository {
    private final JdbcTemplate jdbc;

    public SegmentContextRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<SegmentContext> ROW_MAPPER = (rs, rowNum) -> {
        SegmentContext sc = new SegmentContext();
        sc.setId(rs.getInt("id"));
        sc.setSegmentId(rs.getInt("segment_id"));
        sc.setContextDefinitionId(rs.getInt("context_definition_id"));
        sc.setContextValues(rs.getString("context_values"));
        sc.setOperator(rs.getString("operator"));
        sc.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return sc;
    };

    /**
     * Lightweight projection joining segment contexts with their definition names and types.
     */
    public static final class SegmentContextWithName {
        private final Integer segmentId;
        private final Integer contextDefinitionId;
        private final String contextDefinitionName;
        private final String contextType;
        private final String operator;
        private final String contextValues;

        public SegmentContextWithName(Integer segmentId, Integer contextDefinitionId, String contextDefinitionName, String contextType, String operator, String contextValues) {
            this.segmentId = segmentId;
            this.contextDefinitionId = contextDefinitionId;
            this.contextDefinitionName = contextDefinitionName;
            this.contextType = contextType;
            this.operator = operator;
            this.contextValues = contextValues;
        }

        public Integer getSegmentId() { return segmentId; }
        public Integer getContextDefinitionId() { return contextDefinitionId; }
        public String getContextDefinitionName() { return contextDefinitionName; }
        public String getContextType() { return contextType; }
        public String getOperator() { return operator; }
        public String getContextValues() { return contextValues; }
    }

    /**
     * Returns all context entries for a segment.
     *
     * @param segmentId the segment ID
     * @return list of segment contexts
     */
    public List<SegmentContext> findBySegmentId(Integer segmentId) {
        return jdbc.query("SELECT id, segment_id, context_definition_id, context_values, operator, created_at FROM segment_contexts WHERE segment_id = ?", ROW_MAPPER, segmentId);
    }

    /**
     * Returns context entries with definition names for the given segment IDs.
     *
     * @param segmentIds list of segment IDs
     * @return list of context entries with names joined from context definitions
     */
    public List<SegmentContextWithName> findContextsBySegmentIds(List<Integer> segmentIds) {
        if (segmentIds == null || segmentIds.isEmpty()) {
            return Collections.emptyList();
        }
        String placeholders = String.join(",", Collections.nCopies(segmentIds.size(), "?"));
        String sql = "SELECT sc.segment_id, cd.id as context_definition_id, cd.name as context_name, cd.context_type, sc.operator, sc.context_values " +
                     "FROM segment_contexts sc " +
                     "JOIN context_definitions cd ON cd.id = sc.context_definition_id " +
                     "WHERE sc.segment_id IN (" + placeholders + ") " +
                     "ORDER BY sc.segment_id, sc.id";
        return jdbc.query(sql, (rs, rowNum) ->
            new SegmentContextWithName(
                rs.getInt("segment_id"),
                rs.getInt("context_definition_id"),
                rs.getString("context_name"),
                rs.getString("context_type"),
                rs.getString("operator"),
                rs.getString("context_values")
            ), segmentIds.toArray());
    }

    /**
     * Deletes all context entries for a segment.
     *
     * @param segmentId the segment ID
     */
    public void deleteBySegmentId(Integer segmentId) {
        jdbc.update("DELETE FROM segment_contexts WHERE segment_id = ?", segmentId);
    }

    /**
     * Checks if any segment references the given context definition.
     *
     * @param contextDefinitionId the context definition ID
     * @return true if at least one segment uses the context definition
     */
    public boolean existsByContextDefinitionId(Integer contextDefinitionId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM segment_contexts WHERE context_definition_id = ?",
            Integer.class, contextDefinitionId);
        return count != null && count > 0;
    }

    /**
     * Inserts or upserts a segment context entry.
     *
     * @param ctx the segment context to save
     * @return the saved segment context
     */
    public SegmentContext save(SegmentContext ctx) {
        String operator = ctx.getOperator() != null ? ctx.getOperator() : "in";
        if (ctx.getId() == null) {
            Instant createTime = Instant.now();
            String sql = "INSERT INTO segment_contexts (segment_id, context_definition_id, operator, context_values, created_at) " +
                         "VALUES (?, ?, ?, ?, ?) " +
                         "ON CONFLICT (segment_id, context_definition_id, operator) DO UPDATE SET context_values = EXCLUDED.context_values " +
                         "RETURNING id, segment_id, context_definition_id, operator, context_values, created_at";
            SegmentContext result = jdbc.queryForObject(sql, (rs, _) -> {
                SegmentContext sc = new SegmentContext();
                sc.setId(rs.getInt("id"));
                sc.setSegmentId(rs.getInt("segment_id"));
                sc.setContextDefinitionId(rs.getInt("context_definition_id"));
                sc.setOperator(rs.getString("operator"));
                sc.setContextValues(rs.getString("context_values"));
                sc.setCreatedAt(rs.getTimestamp("created_at").toInstant());
                return sc;
            }, ctx.getSegmentId(), ctx.getContextDefinitionId(), operator, ctx.getContextValues(), Timestamp.from(createTime));
            return result;
        } else {
            jdbc.update("UPDATE segment_contexts SET operator = ?, context_values = ? WHERE id = ?",
                operator, ctx.getContextValues(), ctx.getId());
        }
        ctx.setOperator(operator);
        return ctx;
    }


}