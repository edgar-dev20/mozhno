package dev.mozhno.flags;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.*;
import java.util.stream.Collectors;

/**
 * JDBC-based repository for {@link FlagTagValue} join records.
 */
@Repository
public class FlagTagValueRepository {
    private final JdbcTemplate jdbc;

    public FlagTagValueRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<FlagTagValue> ROW_MAPPER = (rs, rowNum) -> {
        FlagTagValue ftv = new FlagTagValue();
        ftv.setId(rs.getInt("id"));
        ftv.setFlagId(rs.getInt("flag_id"));
        ftv.setTagId(rs.getInt("tag_id"));
        ftv.setTagValue(rs.getString("tag_value"));
        return ftv;
    };

    /**
     * Returns all tag-value associations for a flag.
     *
     * @param flagId the flag ID
     * @return list of flag-tag-value associations
     */
    public List<FlagTagValue> findByFlagId(Integer flagId) {
        return jdbc.query("SELECT id, flag_id, tag_id, tag_value FROM flag_tag_values WHERE flag_id = ?", ROW_MAPPER, flagId);
    }

    /**
     * Inserts a flag-tag-value association.
     *
     * @param ftv the association to save
     */
    public void save(FlagTagValue ftv) {
        jdbc.update("INSERT INTO flag_tag_values (flag_id, tag_id, tag_value) VALUES (?, ?, ?)",
            ftv.getFlagId(), ftv.getTagId(), ftv.getTagValue());
    }

    /**
     * Batch-inserts multiple tag-value associations for a flag in a single JDBC call.
     *
     * @param flagId the flag ID
     * @param tags   the list of tag-value pairs to save
     */
    public void saveBatch(Integer flagId, List<FlagRequest.TagValue> tags) {
        jdbc.batchUpdate(
            "INSERT INTO flag_tag_values (flag_id, tag_id, tag_value) VALUES (?, ?, ?)",
            tags,
            tags.size(),
            (ps, tv) -> {
                ps.setInt(1, flagId);
                ps.setInt(2, tv.getTagId());
                ps.setString(3, tv.getValue());
            });
    }

    /**
     * Returns all tag-value associations for a list of flag IDs.
     *
     * @param flagIds the flag IDs
     * @return map of flagId to list of tag-value associations
     */
    public Map<Integer, List<FlagTagValue>> findByFlagIds(List<Integer> flagIds) {
        if (flagIds.isEmpty()) return Collections.emptyMap();
        String placeholders = flagIds.stream().map(id -> "?").collect(Collectors.joining(","));
        List<FlagTagValue> values = jdbc.query(
            "SELECT id, flag_id, tag_id, tag_value FROM flag_tag_values WHERE flag_id IN (" + placeholders + ")",
            ROW_MAPPER, flagIds.toArray());
        return values.stream().collect(Collectors.groupingBy(FlagTagValue::getFlagId));
    }

    /**
     * Deletes all tag-value associations for a flag.
     *
     * @param flagId the flag ID
     */
    public void deleteByFlagId(Integer flagId) {
        jdbc.update("DELETE FROM flag_tag_values WHERE flag_id = ?", flagId);
    }

    public void deleteByProjectId(Integer projectId) {
        jdbc.update("DELETE FROM flag_tag_values USING flags WHERE flags.id = flag_tag_values.flag_id AND flags.project_id = ?", projectId);
    }
}