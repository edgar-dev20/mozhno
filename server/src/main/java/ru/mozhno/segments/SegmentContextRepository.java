package ru.mozhno.segments;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

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
        sc.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return sc;
    };

    public static final class SegmentContextWithName {
        private final Integer segmentId;
        private final String contextDefinitionName;
        private final String contextValues;

        public SegmentContextWithName(Integer segmentId, String contextDefinitionName, String contextValues) {
            this.segmentId = segmentId;
            this.contextDefinitionName = contextDefinitionName;
            this.contextValues = contextValues;
        }

        public Integer getSegmentId() { return segmentId; }
        public String getContextDefinitionName() { return contextDefinitionName; }
        public String getContextValues() { return contextValues; }
    }

    public List<SegmentContext> findBySegmentId(Integer segmentId) {
        return jdbc.query("SELECT id, segment_id, context_definition_id, context_values, created_at FROM segment_contexts WHERE segment_id = ?", ROW_MAPPER, segmentId);
    }

    public List<SegmentContextWithName> findContextsBySegmentIds(List<Integer> segmentIds) {
        if (segmentIds == null || segmentIds.isEmpty()) {
            return Collections.emptyList();
        }
        String placeholders = String.join(",", Collections.nCopies(segmentIds.size(), "?"));
        String sql = "SELECT sc.segment_id, cd.name as context_name, sc.context_values " +
                     "FROM segment_contexts sc " +
                     "JOIN context_definitions cd ON cd.id = sc.context_definition_id " +
                     "WHERE sc.segment_id IN (" + placeholders + ") " +
                     "ORDER BY sc.segment_id, sc.id";
        return jdbc.query(sql, (rs, rowNum) ->
            new SegmentContextWithName(
                rs.getInt("segment_id"),
                rs.getString("context_name"),
                rs.getString("context_values")
            ), segmentIds.toArray());
    }

    public void deleteBySegmentId(Integer segmentId) {
        jdbc.update("DELETE FROM segment_contexts WHERE segment_id = ?", segmentId);
    }

    public SegmentContext save(SegmentContext ctx) {
        if (ctx.getId() == null) {
            Instant createTime = Instant.now();
            jdbc.update("INSERT INTO segment_contexts (segment_id, context_definition_id, context_values, created_at) VALUES (?, ?, ?, ?) ON CONFLICT (segment_id, context_definition_id) DO UPDATE SET context_values = EXCLUDED.context_values",
                ctx.getSegmentId(), ctx.getContextDefinitionId(), ctx.getContextValues(), Timestamp.from(createTime));
            ctx.setId(getLastInsertId());
            ctx.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE segment_contexts SET context_values = ? WHERE id = ?",
                ctx.getContextValues(), ctx.getId());
        }
        return ctx;
    }

    private Integer getLastInsertId() {
        return jdbc.queryForObject("SELECT lastval()", Integer.class);
    }
}