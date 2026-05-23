package ru.mozhno.environments;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnvironmentService {
    private final EnvironmentRepository environmentRepository;

    @Transactional(readOnly = true)
    public List<Environment> findByProjectId(Integer projectId) {
        return environmentRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Environment findById(Integer id) {
        return environmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Environment not found: " + id));
    }

    @Transactional
    public Environment update(Integer id, String name) {
        var env = environmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Environment not found: " + id));
        env.setName(name);
        return environmentRepository.save(env);
    }

    @Transactional
    public Environment create(Integer projectId, String name) {
        var env = new Environment();
        env.setProjectId(projectId);
        env.setName(name);
        return environmentRepository.save(env);
    }

    @Transactional
    public void delete(Integer id) {
        environmentRepository.deleteById(id);
    }
}