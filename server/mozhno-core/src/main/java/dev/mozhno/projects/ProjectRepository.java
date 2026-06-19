package dev.mozhno.projects;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import org.springframework.cache.annotation.Cacheable;
import dev.mozhno.CacheNames;
import org.springframework.cache.annotation.CacheEvict;

/**
 * JDBC-based repository for {@link Project} entities.
 */
@Repository
public class ProjectRepository {
    private final JdbcTemplate jdbc;

    public ProjectRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Project> ROW_MAPPER = (rs, rowNum) -> {
        Project p = new Project();
        p.setId(rs.getInt("id"));
        p.setName(rs.getString("name"));
        p.setDescription(rs.getString("description"));
        p.setLogo(rs.getString("logo"));
        p.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        return p;
    };

    /**
     * Returns all projects.
     *
     * @return list of all projects
     */
    public List<Project> findAll() {
        return jdbc.query("SELECT id, name, description, logo, created_at FROM projects ORDER BY id", ROW_MAPPER);
    }

    /**
     * Finds a project by its ID.
     *
     * @param id the project ID
     * @return the project, or null if not found
     */
    @Cacheable(CacheNames.PROJECTS)
    public Project findById(Integer id) {
        try {
            return jdbc.queryForObject("SELECT id, name, description, logo, created_at FROM projects WHERE id = ?", ROW_MAPPER, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Inserts or updates a project.
     *
     * @param project the project to save
     * @return the saved project
     */
    @CacheEvict(value = CacheNames.PROJECTS, key = "#project.id")
    public Project save(Project project) {
        if (project.getId() == null) {
            Instant createTime = Instant.now();
            GeneratedKeyHolder keyHolder = new GeneratedKeyHolder();
            jdbc.update(con -> {
                PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO projects (name, description, logo, created_at) VALUES (?, ?, ?, ?)",
                    new String[]{"id"});
                ps.setString(1, project.getName());
                ps.setString(2, project.getDescription());
                ps.setString(3, project.getLogo());
                ps.setTimestamp(4, Timestamp.from(createTime));
                return ps;
            }, keyHolder);
            project.setId(keyHolder.getKey().intValue());
            project.setCreatedAt(createTime);
        } else {
            jdbc.update("UPDATE projects SET name = ?, description = ?, logo = ? WHERE id = ?",
                project.getName(), project.getDescription(), project.getLogo(), project.getId());
        }
        return project;
    }

    /**
     * Deletes a project by its ID.
     *
     * @param id the project ID
     */
    @CacheEvict(value = CacheNames.PROJECTS, key = "#id")
    public void deleteById(Integer id) {
        jdbc.update("DELETE FROM projects WHERE id = ?", id);
    }

    /**
     * Checks whether a project with the given ID exists.
     *
     * @param id the project ID
     * @return true if the project exists
     */
    public boolean existsById(Integer id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM projects WHERE id = ?)", Boolean.class, id));
    }

    /**
     * Returns the total number of projects.
     *
     * @return total project count
     */
    public Integer count() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM projects", Integer.class);
    }

    /**
     * Returns the logo binary data for a project.
     *
     * @param id the project ID
     * @return logo bytes, or null if no logo is set
     */
    public byte[] getLogoData(Integer id) {
        try {
            return jdbc.queryForObject("SELECT logo_data FROM projects WHERE id = ?", byte[].class, id);
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    /**
     * Updates both the logo filename and binary data for a project in a single query.
     *
     * @param id   the project ID
     * @param logo the logo filename
     * @param data the logo bytes
     */
    @CacheEvict(value = CacheNames.PROJECTS, key = "#id")
    public void updateLogo(Integer id, String logo, byte[] data) {
        jdbc.update("UPDATE projects SET logo = ?, logo_data = ? WHERE id = ?", logo, data, id);
    }

    /**
     * Updates the logo binary data for a project.
     *
     * @param id   the project ID
     * @param data the logo bytes
     */
    public void updateLogoData(Integer id, byte[] data) {
        jdbc.update("UPDATE projects SET logo_data = ? WHERE id = ?", data, id);
    }


}
