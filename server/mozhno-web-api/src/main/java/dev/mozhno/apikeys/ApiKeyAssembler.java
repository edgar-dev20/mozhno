package dev.mozhno.apikeys;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ApiKeyAssembler {

    public ApiKeyResponse toResponse(ApiKey apiKey) {
        return toResponse(apiKey, false);
    }

    public ApiKeyResponse toResponse(ApiKey apiKey, boolean exposeFullKey) {
        return ApiKeyResponse.builder()
            .id(apiKey.getId())
            .projectId(apiKey.getProjectId())
            .environmentId(apiKey.getEnvironmentId())
            .name(apiKey.getName())
            .description(apiKey.getDescription())
            .apiKey(exposeFullKey ? apiKey.getApiKey() : mask(apiKey.getApiKey()))
            .keyType(apiKey.getKeyType())
            .lastUsedAt(apiKey.getLastUsedAt())
            .createdAt(apiKey.getCreatedAt())
            .build();
    }

    public List<ApiKeyResponse> toResponseList(List<ApiKey> apiKeys) {
        return apiKeys.stream().map(this::toResponse).toList();
    }

    private static String mask(String key) {
        if (key == null) return null;
        if (key.length() <= 12) return key.substring(0, Math.min(8, key.length())) + "****";
        return key.substring(0, 8) + "****" + key.substring(key.length() - 4);
    }
}
