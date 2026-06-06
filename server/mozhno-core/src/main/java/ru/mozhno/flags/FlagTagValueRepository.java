package ru.mozhno.flags;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import java.util.List;

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

    public List<FlagTagValue> findByFlagId(Integer flagId) {
        return jdbc.query("SELECT id, flag_id, tag_id, tag_value FROM flag_tag_values WHERE flag_id = ?", ROW_MAPPER, flagId);
    }

    public void save(FlagTagValue ftv) {
        jdbc.update("INSERT INTO flag_tag_values (flag_id, tag_id, tag_value) VALUES (?, ?, ?)",
            ftv.getFlagId(), ftv.getTagId(), ftv.getTagValue());
    }

    public void deleteByFlagId(Integer flagId) {
        jdbc.update("DELETE FROM flag_tag_values WHERE flag_id = ?", flagId);
    }
}