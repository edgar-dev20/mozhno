package dev.mozhno.tags;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.NotFoundException;

import java.util.List;

/**
 * Service for managing tags, which are used to categorize and organize flags.
 */
@Service
public class TagService {
    private final TagRepository tagRepository;
    private final DomainEventPublisher events;

    public TagService(TagRepository tagRepository, DomainEventPublisher events) {
        this.tagRepository = tagRepository;
        this.events = events;
    }

    /**
     * Returns all tags for a project.
     *
     * @param projectId the project ID
     * @return list of tags
     */
    @Transactional(readOnly = true)
    public List<Tag> findByProjectId(Integer projectId) {
        return tagRepository.findByProjectId(projectId);
    }

    /**
     * Finds a tag by its ID.
     *
     * @param id the tag ID
     * @return the tag
     * @throws RuntimeException if not found
     */
    @Transactional(readOnly = true)
    public Tag findById(Integer id, Integer projectId) {
        Tag tag;
        if (projectId != null) {
            tag = tagRepository.findByIdAndProjectId(id, projectId);
        } else {
            tag = tagRepository.findById(id);
        }
        if (tag == null) throw new NotFoundException("Tag", id);
        return tag;
    }

    /**
     * Creates a new tag.
     *
     * @param request the tag creation request
     * @return the created tag
     */
    @Transactional
    public Tag create(TagRequest request) {
        Tag tag = new Tag();
        tag.setProjectId(request.getProjectId());
        tag.setName(request.getName());
        tag.setDescription(request.getDescription());
        tag.setColor(request.getColor());
        Tag saved = tagRepository.save(tag);
        events.publish(DomainEvent.of(saved.getProjectId(), "tag.created", "tag",
            saved.getId(), saved.getName(), "Tag created"));
        return saved;
    }

    /**
     * Updates an existing tag.
     *
     * @param id the tag ID
     * @param request the tag update request
     * @return the updated tag
     */
    @Transactional
    public Tag update(Integer id, TagRequest request) {
        Tag tag;
        if (request.getProjectId() != null) {
            tag = tagRepository.findByIdAndProjectId(id, request.getProjectId());
        } else {
            tag = tagRepository.findById(id);
        }
        if (tag == null) throw new NotFoundException("Tag", id);
        tag.setName(request.getName());
        tag.setDescription(request.getDescription());
        tag.setColor(request.getColor());
        Tag saved = tagRepository.save(tag);
        events.publish(DomainEvent.of(saved.getProjectId(), "tag.updated", "tag",
            saved.getId(), saved.getName(), "Tag updated"));
        return saved;
    }

    /**
     * Deletes a tag.
     *
     * @param id the tag ID
     */
    @Transactional
    public void delete(Integer id, Integer projectId) {
        int deleted = tagRepository.deleteById(id, projectId);
        if (deleted == 0) throw new NotFoundException("Tag", id);
        events.publish(DomainEvent.of(projectId, "tag.deleted", "tag",
            id, null, "Tag deleted"));
    }
}