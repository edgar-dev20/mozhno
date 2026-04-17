package dev.mozhno.apikeys;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ApiKeyAssembler {

    public ApiKeyResponse toResponse(ApiKey apiKey) {
        return ApiKeyResponse.builder()
            .id(apiKey.getId())
            .projectId(apiKey.getProjectId())
            .environmentId(apiKey.getEnvironmentId())
            .name(apiKey.getName())
            .description(apiKey.getDescription())
            .type(apiKey.getKeyType())
            .lastUsedAt(apiKey.getLastUsedAt())
            .createdAt(apiKey.getCreatedAt())
            .build();
    }

    public List<ApiKeyResponse> toResponseList(List<ApiKey> apiKeys) {
        return apiKeys.stream().map(this::toResponse).toList();
    }
}
