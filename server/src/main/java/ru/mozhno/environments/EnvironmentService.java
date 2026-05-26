package ru.mozhno.environments;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnvironmentService {
    private final EnvironmentRepository environmentRepository;

    public EnvironmentService(EnvironmentRepository environmentRepository) {
        this.environmentRepository = environmentRepository;
    }

    @Transactional(readOnly = true)
    public List<Environment> findByProjectId(Integer projectId) {
        return environmentRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Environment findById(Integer id) {
        Environment env = environmentRepository.findById(id);
        if (env == null) throw new RuntimeException("Environment not found: " + id);
        return env;
    }

    @Transactional
    public Environment update(Integer id, String name) {
        Environment env = environmentRepository.findById(id);
        if (env == null) throw new RuntimeException("Environment not found: " + id);
        env.setName(name);
        return environmentRepository.save(env);
    }

    @Transactional
    public Environment create(Integer projectId, String name) {
        Environment env = new Environment();
        env.setProjectId(projectId);
        env.setName(name);
        return environmentRepository.save(env);
    }

    @Transactional
    public void delete(Integer id) {
        environmentRepository.deleteById(id);
    }
}