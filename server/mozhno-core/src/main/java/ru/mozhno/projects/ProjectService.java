package ru.mozhno.projects;

import org.springframework.stereotype.Service;
import ru.mozhno.events.DomainEvent;
import ru.mozhno.events.DomainEventPublisher;

import java.util.List;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final DomainEventPublisher events;

    public ProjectService(ProjectRepository projectRepository, DomainEventPublisher events) {
        this.projectRepository = projectRepository;
        this.events = events;
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Project findById(Integer id) {
        Project p = projectRepository.findById(id);
        if (p == null) {
            throw new RuntimeException("Project not found: " + id);
        }
        return p;
    }

    public Project create(ProjectRequest request) {
        Project p = new Project();
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        Project saved = projectRepository.save(p);
        events.publish(new DomainEvent(saved.getId(), "project.created", "project",
            saved.getId(), saved.getName(), null));
        return saved;
    }

    public Project update(Integer id, ProjectRequest request) {
        Project p = projectRepository.findById(id);
        if (p == null) {
            throw new RuntimeException("Project not found: " + id);
        }
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        Project saved = projectRepository.save(p);
        events.publish(new DomainEvent(saved.getId(), "project.updated", "project",
            saved.getId(), saved.getName(), null));
        return saved;
    }

    public void delete(Integer id) {
        Project p = projectRepository.findById(id);
        String name = p != null ? p.getName() : String.valueOf(id);
        events.publish(new DomainEvent(id, "project.deleted", "project",
            id, name, "Project deleted"));
        projectRepository.deleteById(id);
    }
}