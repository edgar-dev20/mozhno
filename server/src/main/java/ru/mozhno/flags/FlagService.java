package ru.mozhno.flags;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.projects.ProjectRepository;
import ru.mozhno.tags.TagRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FlagService {
    private final FlagRepository flagRepository;
    private final ProjectRepository projectRepository;
    private final TagRepository tagRepository;
    private final FlagTagValueRepository flagTagValueRepository;

    @Transactional(readOnly = true)
    public Flag findById(Integer id) {
        return flagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flag not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<Flag> findByProjectId(Integer projectId) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        return flagRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Flag findByProjectIdAndKey(Integer projectId, String key) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        return flagRepository.findByProjectIdAndKeyWithStrategies(projectId, key)
                .orElseThrow(() -> new RuntimeException("Flag not found: " + key));
    }

    @Transactional
    public Flag create(FlagRequest request) {
        projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));
        var flag = new Flag();
        flag.setProjectId(request.getProjectId());
        flag.setName(request.getName());
        flag.setKey(request.getKey());
        flag.setDescription(request.getDescription());
        flag = flagRepository.save(flag);

        if (request.getTags() != null) {
            for (FlagRequest.TagValue tv : request.getTags()) {
                var ftv = new FlagTagValue();
                ftv.setFlag(flag);
                ftv.setTag(tagRepository.findById(tv.getTagId())
                        .orElseThrow(() -> new RuntimeException("Tag not found: " + tv.getTagId())));
                ftv.setTagValue(tv.getValue());
                flagTagValueRepository.save(ftv);
            }
        }
        return flag;
    }

    @Transactional
    public Flag update(Integer id, FlagRequest request) {
        var flag = flagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flag not found: " + id));
        flag.setName(request.getName());
        flag.setKey(request.getKey());
        flag.setDescription(request.getDescription());
        flag = flagRepository.save(flag);

        flagTagValueRepository.deleteByFlagId(id);

        if (request.getTags() != null) {
            for (FlagRequest.TagValue tv : request.getTags()) {
                var ftv = new FlagTagValue();
                ftv.setFlag(flag);
                ftv.setTag(tagRepository.findById(tv.getTagId())
                        .orElseThrow(() -> new RuntimeException("Tag not found: " + tv.getTagId())));
                ftv.setTagValue(tv.getValue());
                flagTagValueRepository.save(ftv);
            }
        }
        return flag;
    }

    @Transactional
    public void delete(Integer id) {
        flagTagValueRepository.deleteByFlagId(id);
        flagRepository.deleteById(id);
    }
}