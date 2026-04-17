package dev.mozhno.projects;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProjectAssembler {

    public ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
            .id(project.getId())
            .name(project.getName())
            .description(project.getDescription())
            .logo(project.getLogo())
            .createdAt(project.getCreatedAt())
            .build();
    }

    public List<ProjectResponse> toResponseList(List<Project> projects) {
        return projects.stream().map(this::toResponse).toList();
    }
}
