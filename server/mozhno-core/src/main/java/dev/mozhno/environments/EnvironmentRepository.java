package dev.mozhno.environments;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

/**
 * JDBC-based repository for {@link Environment} entities.
 */
@Repository
public class EnvironmentRepository {
    private final JdbcTemplate jdbc;

    public EnvironmentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Environment> ROW_MAPPER = (rs, rowNum) -> {
        Environment e = new Environment();
        e.setId(rs.getInt("id"));
        e.setName(rs.getString("name"));
        e.setDescription(rs.getString("description"));
        e.setColor(rs.getString("color"));
        e.setRequireActivationApproval(rs.getBoolean("require_activation_approval"));
        e.setProjectId(rs.getInt("project_id"));
        e.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return e;
    };

    /**
     * Returns all environments for a project.
     *
     * @param projectId the project ID
     * @return list of environments
     */
    public List<Environment> findByProjectId(Integer projectId) {
        return jdbc.query("SELECT id, name, description, color, require_activation_approval, project_id, created_at FROM environments WHERE project_id = ? ORDER BY id", ROW_MAPPER, projectId);
    }

    /**
     * Finds an environment by its ID.
     *
     * @param id the environment ID
     * @return the environment, or null if not found
     */
    public Environment findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, name, description, color, require_activation_approval, project_id, created_at FROM environments WHERE id = ?", ROW_MAPPER, id);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    public Environment findByIdAndProjectId(Integer id, Integer projectId) {
        try {
            return jdbc.queryForObject("SELECT id, name, description, color, require_activation_approval, project_id, created_at FROM environments WHERE id = ? AND project_id = ?", ROW_MAPPER, id, projectId);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Inserts an environment only if the project is below the given limit.
     *
     * @param projectId the project ID
     * @param name the environment name
     * @param maxLimit the maximum allowed environments
     * @return the saved environment, or null if the limit is exceeded
     */
    public Environment saveWithLimitCheck(Integer projectId, String name, int maxLimit) {
        try {
            return jdbc.queryForObject(
                "INSERT INTO environments (name, description, project_id, created_at) " +
                "SELECT ?, NULL, ?, NOW() " +
                "WHERE (SELECT COUNT(*) FROM environments WHERE project_id = ?) < ? " +
                "RETURNING id, name, description, color, require_activation_approval, project_id, created_at",
                ROW_MAPPER, name, projectId, projectId, maxLimit);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Inserts or updates an environment.
     *
     * @param env the environment to save
     * @return the saved environment
     */
    public Environment save(Environment env) {
        if (env.getId() == null) {
            Instant createTime = Instant.now();
            GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO environments (name, description, color, require_activation_approval, project_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    new String[]{"id"});
                ps.setString(1, env.getName());
                ps.setString(2, env.getDescription());
                ps.setString(3, env.getColor());
                ps.setBoolean(4, env.isRequireActivationApproval());
                ps.setInt(5, env.getProjectId());
                ps.setTimestamp(6, Timestamp.from(createTime));
                return ps;
            }, keyHolder);
            env.setId(keyHolder.getKey().intValue());
            env.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE environments SET name = ?, description = ?, color = ?, require_activation_approval = ? WHERE id = ? AND project_id = ?",
                env.getName(), env.getDescription(), env.getColor(), env.isRequireActivationApproval(), env.getId(), env.getProjectId());
        }
        return env;
    }

    /**
     * Deletes an environment by its ID and project ID.
     *
     * @param id the environment ID
     * @param projectId the project ID
     * @return number of deleted rows
     */
    public int deleteById(Integer id, Integer projectId) {
        return jdbc.update("DELETE FROM environments WHERE id = ? AND project_id = ?", id, projectId);
    }

    /**
     * Counts environments in a project.
     *
     * @param projectId the project ID
     * @return the environment count
     */
    public int countByProjectId(Integer projectId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM environments WHERE project_id = ?", Integer.class, projectId);
        return count != null ? count : 0;
    }

    public void deleteByProjectId(Integer projectId) {
        jdbc.update("DELETE FROM environments WHERE project_id = ?", projectId);
    }
}