package dev.mozhno.flags;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.NotFoundException;
import dev.mozhno.exception.QuotaExceededException;
import dev.mozhno.common.PageResponse;
import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.tags.TagRepository;

import java.time.Instant;
import java.util.List;

/**
 * Service for managing feature flags within a project.
 * Handles CRUD operations, archival, and quota enforcement for flags and their associated tags.
 */
@Service
public class FlagService {
    private final FlagRepository flagRepository;
    private final TagRepository tagRepository;
    private final FlagTagValueRepository flagTagValueRepository;
    private final DomainEventPublisher events;
    private final QuotaSpi quotaSpi;

    public FlagService(FlagRepository flagRepository,
                       TagRepository tagRepository, FlagTagValueRepository flagTagValueRepository,
                       DomainEventPublisher events, QuotaSpi quotaSpi) {
        this.flagRepository = flagRepository;
        this.tagRepository = tagRepository;
        this.flagTagValueRepository = flagTagValueRepository;
        this.events = events;
        this.quotaSpi = quotaSpi;
    }

    /**
     * Finds a flag by its ID and verifies it belongs to the given project.
     *
     * @param id the flag ID
     * @param projectId the project ID to verify ownership
     * @return the flag
     * @throws RuntimeException if the flag is not found or belongs to another project
     */
    @Transactional(readOnly = true)
    public Flag findById(Integer id, Integer projectId) {
        Flag flag = flagRepository.findByIdAndProjectId(id, projectId);
        if (flag == null) throw new NotFoundException("Flag", id);
        return flag;
    }

    @Transactional(readOnly = true)
    public Flag findById(Integer id) {
        return findById(id, null);
    }

    /**
     * Returns all non-archived flags belonging to the given project.
     *
     * @param projectId the project ID
     * @return list of flags
     * @throws RuntimeException if the project is not found
     */
    @Transactional(readOnly = true)
    public List<Flag> findByProjectId(Integer projectId) {
        return flagRepository.findByProjectId(projectId);
    }

    /**
     * Returns all flags (including archived) belonging to the given project.
     *
     * @param projectId the project ID
     * @return list of flags including archived ones
     */
    @Transactional(readOnly = true)
    public List<Flag> findByProjectIdIncludingArchived(Integer projectId) {
        return flagRepository.findByProjectIdIncludingArchived(projectId);
    }

    /**
     * Finds a flag by its project and key.
     *
     * @param projectId the project ID
     * @param key the flag key
     * @return the flag
     * @throws RuntimeException if the project or flag is not found
     */
    @Transactional(readOnly = true)
    public Flag findByProjectIdAndKey(Integer projectId, String key) {
        Flag flag = flagRepository.findByProjectIdAndKey(projectId, key);
        if (flag == null) throw new NotFoundException("Flag", key);
        return flag;
    }

    /**
     * Returns all non-archived flags for a project with their strategy for the given environment.
     *
     * @param projectId the project ID
     * @param environmentId the environment ID
     * @return list of flags paired with their environment strategies
     */
    @Transactional(readOnly = true)
    public List<FlagWithStrategy> findByProjectIdWithStrategyForEnvironment(Integer projectId, Integer environmentId) {
        return flagRepository.findByProjectIdWithStrategyForEnvironment(projectId, environmentId);
    }

    /**
     * Returns all flags with their strategies for all environments.
     * A flag may appear multiple times in the result — once per environment strategy.
     *
     * @param projectId the project ID
     * @return list of flag+strategy pairs
     */
    @Transactional(readOnly = true)
    public List<FlagWithStrategy> findByProjectIdWithAllEnvironmentStrategies(Integer projectId) {
        return flagRepository.findByProjectIdWithAllEnvironmentStrategies(projectId);
    }


    @Transactional(readOnly = true)
    public PageResponse<FlagWithStrategy> findByProjectIdWithAllEnvironmentStrategiesPaginated(Integer projectId, int page, int size) {
        long total = flagRepository.countByProjectId(projectId, true);
        int offset = page * size;
        List<FlagWithStrategy> items = flagRepository.findByProjectIdWithAllEnvironmentStrategiesPaginated(projectId, offset, size);
        return new PageResponse<>(items, page, size, total);
    }

    @Transactional(readOnly = true)
    public PageResponse<Flag> findByProjectIdPaginated(Integer projectId, boolean includeArchived, int page, int size) {
        long total = flagRepository.countByProjectId(projectId, includeArchived);
        int offset = page * size;
        List<Flag> items = flagRepository.findByProjectIdPaginated(projectId, includeArchived, offset, size);
        return new PageResponse<>(items, page, size, total);
    }

    /**
     * Creates a new flag with no explicit creator.
     *
     * @param request the flag creation request
     * @return the created flag
     * @throws RuntimeException if the project is not found or quota is exceeded
     */
    @Transactional
    public Flag create(FlagRequest request) {
        return create(request, null);
    }

    /**
     * Creates a new flag.
     *
     * @param request the flag creation request
     * @param creatorId the ID of the user creating the flag, may be null
     * @return the created flag
     * @throws RuntimeException if the project is not found, quota is exceeded, or flag type is invalid
     */
    @Transactional
    public Flag create(FlagRequest request, Integer creatorId) {
        QuotaSpi.QuotaResult quota = quotaSpi.canCreateFlag(request.getProjectId());
        if (quota instanceof QuotaSpi.Blocked blocked) {
            throw new QuotaExceededException(blocked.current(), blocked.limit(), blocked.planName());
        }

        Flag flag = new Flag();
        flag.setProjectId(request.getProjectId());
        flag.setName(request.getName());
        flag.setKey(request.getKey());
        flag.setDescription(request.getDescription());
        flag.setEnabled(request.getEnabled() != null ? request.getEnabled() : false);
        flag.setCreatorId(creatorId);
        if (request.getFlagType() != null) {
            try {
                flag.setFlagType(FlagType.valueOf(request.getFlagType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid flag type: " + request.getFlagType() + ". Must be RELEASE or KILLSWITCH");
            }
        }
        flag = flagRepository.save(flag);

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            if (request.getTags().size() > 10) {
                throw new BadRequestException("Не более 10 тегов на флаг");
            }
            for (FlagRequest.TagValue tv : request.getTags()) {
                if (tagRepository.findById(tv.getTagId()) == null) {
                    throw new NotFoundException("Tag", tv.getTagId());
                }
            }
            flagTagValueRepository.saveBatch(flag.getId(), request.getTags());
        }

        events.publish(DomainEvent.of(flag.getProjectId(), "flag.created", "flag",
            flag.getId(), flag.getName(), "Flag created: " + flag.getKey()));
        return flag;
    }

    /**
     * Updates an existing flag and replaces its tag assignments.
     *
     * @param id the flag ID
     * @param request the flag update request
     * @return the updated flag
     * @throws RuntimeException if the flag or a tag is not found, or flag type is invalid
     */
    @Transactional
    public Flag update(Integer id, FlagRequest request) {
        Flag flag = flagRepository.findByIdAndProjectId(id, request.getProjectId());
        if (flag == null) throw new NotFoundException("Flag", id);
        flag.setName(request.getName());
        flag.setKey(request.getKey());
        flag.setDescription(request.getDescription());
        if (request.getEnabled() != null) {
            flag.setEnabled(request.getEnabled());
        }
        if (request.getFlagType() != null) {
            try {
                flag.setFlagType(FlagType.valueOf(request.getFlagType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid flag type: " + request.getFlagType() + ". Must be RELEASE or KILLSWITCH");
            }
        }
        flag = flagRepository.save(flag);

        flagTagValueRepository.deleteByFlagId(id);

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            if (request.getTags().size() > 10) {
                throw new BadRequestException("Не более 10 тегов на флаг");
            }
            for (FlagRequest.TagValue tv : request.getTags()) {
                if (tagRepository.findById(tv.getTagId()) == null) {
                    throw new NotFoundException("Tag", tv.getTagId());
                }
            }
            flagTagValueRepository.saveBatch(id, request.getTags());
        }

        events.publish(DomainEvent.of(flag.getProjectId(), "flag.updated", "flag",
            flag.getId(), flag.getName(), "Flag updated: " + flag.getKey()));
        return flag;
    }

    /**
     * Deletes a flag and its associated tag values.
     *
     * @param id the flag ID
     */
    @Transactional
    public void delete(Integer id, Integer projectId) {
        flagTagValueRepository.deleteByFlagId(id);
        int deleted = flagRepository.deleteById(id, projectId);
        if (deleted == 0) throw new NotFoundException("Flag", id);
        events.publish(DomainEvent.of(projectId, "flag.deleted", "flag",
            id, null, "Flag deleted"));
    }

    @Transactional
    public void delete(Integer id) {
        delete(id, null);
    }

    /**
     * Archives a flag without recording who performed the action.
     *
     * @param id the flag ID
     * @return the archived flag
     */
    @Transactional
    public Flag archive(Integer id) {
        return archive(id, null, null);
    }

    @Transactional
    public Flag archive(Integer id, Integer archivedBy) {
        return archive(id, archivedBy, null);
    }

    /**
     * Archives a flag.
     *
     * @param id the flag ID
     * @param archivedBy the ID of the user who archived the flag, may be null
     * @return the archived flag
     * @throws RuntimeException if the flag is not found
     */
    @Transactional
    public Flag archive(Integer id, Integer archivedBy, Integer projectId) {
        int affected = flagRepository.setArchived(id, true, archivedBy, projectId);
        if (affected == 0) throw new NotFoundException("Flag", id);
        Flag flag = new Flag();
        flag.setId(id);
        flag.setProjectId(projectId);
        flag.setArchived(true);
        flag.setArchivedBy(archivedBy);
        flag.setArchivedAt(Instant.now());
        events.publish(DomainEvent.of(projectId, "flag.archived", "flag",
            id, null, "Flag archived"));
        return flag;
    }

    /**
     * Unarchives a previously archived flag.
     *
     * @param id the flag ID
     * @return the unarchived flag
     * @throws RuntimeException if the flag is not found
     */
    @Transactional
    public Flag unarchive(Integer id, Integer projectId) {
        int affected = flagRepository.clearArchived(id, projectId);
        if (affected == 0) throw new NotFoundException("Flag", id);
        Flag flag = new Flag();
        flag.setId(id);
        flag.setProjectId(projectId);
        flag.setArchived(false);
        events.publish(DomainEvent.of(projectId, "flag.unarchived", "flag",
            id, null, "Flag unarchived"));
        return flag;
    }

    public Flag unarchive(Integer id) {
        return unarchive(id, null);
    }
}
