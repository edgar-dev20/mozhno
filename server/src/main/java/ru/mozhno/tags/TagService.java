package ru.mozhno.tags;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.events.DomainEvent;
import ru.mozhno.events.DomainEventPublisher;

import java.util.List;

@Service
public class TagService {
    private final TagRepository tagRepository;
    private final DomainEventPublisher events;

    public TagService(TagRepository tagRepository, DomainEventPublisher events) {
        this.tagRepository = tagRepository;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<Tag> findByProjectId(Integer projectId) {
        return tagRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Tag findById(Integer id) {
        Tag tag = tagRepository.findById(id);
        if (tag == null) throw new RuntimeException("Tag not found: " + id);
        return tag;
    }

    @Transactional
    public Tag create(TagRequest request) {
        Tag tag = new Tag();
        tag.setProjectId(request.getProjectId());
        tag.setName(request.getName());
        tag.setDescription(request.getDescription());
        tag.setColor(request.getColor());
        Tag saved = tagRepository.save(tag);
        events.publish(new DomainEvent(saved.getProjectId(), "tag.created", "tag",
            saved.getId(), saved.getName(), "Tag created"));
        return saved;
    }

    @Transactional
    public Tag update(Integer id, TagRequest request) {
        Tag tag = findById(id);
        tag.setName(request.getName());
        tag.setDescription(request.getDescription());
        tag.setColor(request.getColor());
        Tag saved = tagRepository.save(tag);
        events.publish(new DomainEvent(saved.getProjectId(), "tag.updated", "tag",
            saved.getId(), saved.getName(), "Tag updated"));
        return saved;
    }

    @Transactional
    public void delete(Integer id) {
        Tag tag = tagRepository.findById(id);
        String name = tag != null ? tag.getName() : String.valueOf(id);
        Integer projectId = tag != null ? tag.getProjectId() : null;
        tagRepository.deleteById(id);
        events.publish(new DomainEvent(projectId, "tag.deleted", "tag",
            id, name, "Tag deleted"));
    }
}