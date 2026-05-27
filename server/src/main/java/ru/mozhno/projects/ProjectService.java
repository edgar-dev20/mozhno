package ru.mozhno.projects;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
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
        return projectRepository.save(p);
    }

    public Project update(Integer id, ProjectRequest request) {
        Project p = projectRepository.findById(id);
        if (p == null) {
            throw new RuntimeException("Project not found: " + id);
        }
        p.setName(request.getName());
        p.setDescription(request.getDescription());
        return projectRepository.save(p);
    }

    public void delete(Integer id) {
        projectRepository.deleteById(id);
    }
}