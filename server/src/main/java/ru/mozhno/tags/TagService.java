package ru.mozhno.tags;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TagService {
    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
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
        return tagRepository.save(tag);
    }

    @Transactional
    public Tag update(Integer id, TagRequest request) {
        Tag tag = findById(id);
        tag.setName(request.getName());
        tag.setDescription(request.getDescription());
        tag.setColor(request.getColor());
        return tagRepository.save(tag);
    }

    @Transactional
    public void delete(Integer id) {
        tagRepository.deleteById(id);
    }
}