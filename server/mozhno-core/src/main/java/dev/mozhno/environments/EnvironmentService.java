package dev.mozhno.environments;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.exception.NotFoundException;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.util.QuotaValidator;

import java.util.List;

@Service
public class EnvironmentService {
    private final EnvironmentRepository environmentRepository;
    private final DomainEventPublisher events;
    private final QuotaSpi quotaSpi;

    public EnvironmentService(EnvironmentRepository environmentRepository, DomainEventPublisher events,
                               QuotaSpi quotaSpi) {
        this.environmentRepository = environmentRepository;
        this.events = events;
        this.quotaSpi = quotaSpi;
    }

    @Transactional(readOnly = true)
    public List<Environment> findByProjectId(Integer projectId) {
        return environmentRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Environment findById(Integer id, Integer projectId) {
        Environment env;
        if (projectId != null) {
            env = environmentRepository.findByIdAndProjectId(id, projectId);
        } else {
            env = environmentRepository.findById(id);
        }
        if (env == null) throw new NotFoundException("Environment", id);
        return env;
    }

    @Transactional
    public Environment update(Integer id, String name, String description, String color,
                              boolean requireActivationApproval, Integer projectId) {
        Environment env;
        if (projectId != null) {
            env = environmentRepository.findByIdAndProjectId(id, projectId);
        } else {
            env = environmentRepository.findById(id);
        }
        if (env == null) throw new NotFoundException("Environment", id);
        env.setName(name);
        env.setDescription(description);
        env.setColor(normalizeColor(color));
        env.setRequireActivationApproval(requireActivationApproval);
        Environment saved = environmentRepository.save(env);
        events.publish(DomainEvent.of(saved.getProjectId(), "environment.updated", "environment",
            saved.getId(), saved.getName(), "Environment renamed to " + name));
        return saved;
    }

    @Transactional
    public Environment create(Integer projectId, String name, String description, String color,
                              boolean requireActivationApproval) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Environment name is required");
        }
        if (name.length() > 255) {
            throw new BadRequestException("Environment name must not exceed 255 characters");
        }
        QuotaValidator.check(quotaSpi.canCreateEnvironment(projectId));
        Environment env = new Environment();
        env.setProjectId(projectId);
        env.setName(name);
        env.setDescription(description);
        env.setColor(normalizeColor(color));
        env.setRequireActivationApproval(requireActivationApproval);
        Environment saved = environmentRepository.save(env);
        events.publish(DomainEvent.of(saved.getProjectId(), "environment.created", "environment",
            saved.getId(), saved.getName(), "Environment created"));
        return saved;
    }

    @Transactional
    public void delete(Integer id, Integer projectId) {
        Environment env;
        if (projectId != null) {
            env = environmentRepository.findByIdAndProjectId(id, projectId);
        } else {
            env = environmentRepository.findById(id);
        }
        if (env == null) throw new NotFoundException("Environment", id);
        int deleted = environmentRepository.deleteById(id, projectId);
        if (deleted == 0) throw new NotFoundException("Environment", id);
        events.publish(DomainEvent.of(projectId, "environment.deleted", "environment",
            id, env.getName(), "Environment deleted"));
    }

    private static String normalizeColor(String color) {
        if (color == null || color.isBlank()) {
            return null;
        }
        String trimmed = color.trim();
        if (!trimmed.matches("^#[0-9a-fA-F]{6}$")) {
            throw new BadRequestException("Color must be a valid hex code (e.g. #2d9484)");
        }
        return trimmed.toLowerCase();
    }
}
