package ru.mozhno.tags;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public List<Tag> findByProjectId(Integer projectId) {
        return tagRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Tag findById(Integer id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found: " + id));
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