package ru.mozhno.environments;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.events.DomainEvent;
import ru.mozhno.events.DomainEventPublisher;

import java.util.List;

@Service
public class EnvironmentService {
    private final EnvironmentRepository environmentRepository;
    private final DomainEventPublisher events;

    public EnvironmentService(EnvironmentRepository environmentRepository, DomainEventPublisher events) {
        this.environmentRepository = environmentRepository;
        this.events = events;
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
        Environment saved = environmentRepository.save(env);
        events.publish(new DomainEvent(saved.getProjectId(), "environment.updated", "environment",
            saved.getId(), saved.getName(), "Environment renamed to " + name));
        return saved;
    }

    @Transactional
    public Environment create(Integer projectId, String name) {
        Environment env = new Environment();
        env.setProjectId(projectId);
        env.setName(name);
        Environment saved = environmentRepository.save(env);
        events.publish(new DomainEvent(saved.getProjectId(), "environment.created", "environment",
            saved.getId(), saved.getName(), "Environment created"));
        return saved;
    }

    @Transactional
    public void delete(Integer id) {
        Environment env = environmentRepository.findById(id);
        String name = env != null ? env.getName() : String.valueOf(id);
        Integer projectId = env != null ? env.getProjectId() : null;
        environmentRepository.deleteById(id);
        events.publish(new DomainEvent(projectId, "environment.deleted", "environment",
            id, name, "Environment deleted"));
    }
}