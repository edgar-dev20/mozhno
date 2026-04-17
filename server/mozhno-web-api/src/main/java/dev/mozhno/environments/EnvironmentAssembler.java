package dev.mozhno.environments;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EnvironmentAssembler {

    public EnvironmentResponse toResponse(Environment env) {
        return EnvironmentResponse.builder()
            .id(env.getId())
            .name(env.getName())
            .description(env.getDescription())
            .projectId(env.getProjectId())
            .createdAt(env.getCreatedAt())
            .build();
    }

    public List<EnvironmentResponse> toResponseList(List<Environment> envs) {
        return envs.stream().map(this::toResponse).toList();
    }
}
