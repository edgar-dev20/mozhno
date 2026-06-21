package dev.mozhno.environments;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.NotFoundException;
import dev.mozhno.exception.BadRequestException;

import java.util.List;

/**
 * Service for managing deployment environments within a project.
 */
@Service
public class EnvironmentService {
    private final EnvironmentRepository environmentRepository;
    private final DomainEventPublisher events;
    private final EnvironmentLimitProvider limitProvider;

    public EnvironmentService(EnvironmentRepository environmentRepository, DomainEventPublisher events,
                              EnvironmentLimitProvider limitProvider) {
        this.environmentRepository = environmentRepository;
        this.events = events;
        this.limitProvider = limitProvider;
    }

    /**
     * Returns all environments for a project.
     *
     * @param projectId the project ID
     * @return list of environments
     */
    @Transactional(readOnly = true)
    public List<Environment> findByProjectId(Integer projectId) {
        return environmentRepository.findByProjectId(projectId);
    }

    /**
     * Finds an environment by its ID.
     *
     * @param id the environment ID
     * @return the environment
     * @throws RuntimeException if not found
     */
    @Transactional(readOnly = true)
    public Environment findById(Integer id, Integer projectId) {
        Environment env;
        if (projectId != null) {
            env = environmentRepository.findByIdAndProjectId(id, projectId);
        } else {
            env = environmentRepository.findById(id);
        }
        if (env == null) throw new NotFoundException("Environment", id);
        return env;
    }

    /**
     * Updates an environment's name.
     *
     * @param id the environment ID
     * @param name the new name
     * @return the updated environment
     * @throws RuntimeException if not found
     */
    @Transactional
    public Environment update(Integer id, String name, Integer projectId) {
        Environment env;
        if (projectId != null) {
            env = environmentRepository.findByIdAndProjectId(id, projectId);
        } else {
            env = environmentRepository.findById(id);
        }
        if (env == null) throw new NotFoundException("Environment", id);
        env.setName(name);
        Environment saved = environmentRepository.save(env);
        events.publish(DomainEvent.of(saved.getProjectId(), "environment.updated", "environment",
            saved.getId(), saved.getName(), "Environment renamed to " + name));
        return saved;
    }

    /**
     * Returns the maximum number of environments allowed per project.
     *
     * @return the max environments limit
     */
    public int getMaxEnvironments() {
        return limitProvider.getMaxEnvironments();
    }

    /**
     * Creates a new environment for a project.
     *
     * @param projectId the project ID
     * @param name the environment name
     * @return the created environment
     * @throws RuntimeException if the project already has the maximum number of environments
     */
    @Transactional
    public Environment create(Integer projectId, String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Environment name is required");
        }
        if (name.length() > 255) {
            throw new BadRequestException("Environment name must not exceed 255 characters");
        }
        int limit = limitProvider.getMaxEnvironments();
        Environment env = new Environment();
        env.setProjectId(projectId);
        env.setName(name);
        Environment saved = environmentRepository.saveWithLimitCheck(projectId, name, limit);
        if (saved == null) {
            throw new BadRequestException("Maximum number of environments (" + limit + ") reached for this project");
        }
        events.publish(DomainEvent.of(saved.getProjectId(), "environment.created", "environment",
            saved.getId(), saved.getName(), "Environment created"));
        return saved;
    }

    /**
     * Deletes an environment.
     *
     * @param id the environment ID
     */
    @Transactional
    public void delete(Integer id, Integer projectId) {
        Environment env;
        if (projectId != null) {
            env = environmentRepository.findByIdAndProjectId(id, projectId);
        } else {
            env = environmentRepository.findById(id);
        }
        if (env == null) throw new NotFoundException("Environment", id);
        int deleted = environmentRepository.deleteById(id, projectId);
        if (deleted == 0) throw new NotFoundException("Environment", id);
        events.publish(DomainEvent.of(projectId, "environment.deleted", "environment",
            id, env.getName(), "Environment deleted"));
    }
}