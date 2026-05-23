package ru.mozhno.flags;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.projects.ProjectRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FlagService {
    private final FlagRepository flagRepository;
    private final ProjectRepository projectRepository;

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
        return flagRepository.save(flag);
    }

    @Transactional
    public Flag update(Integer id, FlagRequest request) {
        var flag = flagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flag not found: " + id));
        flag.setName(request.getName());
        flag.setKey(request.getKey());
        flag.setDescription(request.getDescription());
        return flagRepository.save(flag);
    }

    @Transactional
    public void delete(Integer id) {
        flagRepository.deleteById(id);
    }
}