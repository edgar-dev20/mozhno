package dev.mozhno.integrations;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class IntegrationAssembler {

    public IntegrationResponse toResponse(Integration integration) {
        return IntegrationResponse.builder()
            .id(integration.getId())
            .projectId(integration.getProjectId())
            .type(integration.getType())
            .name(integration.getName())
            .enabled(integration.isEnabled())
            .lastError(integration.getLastError())
            .createdAt(integration.getCreatedAt())
            .updatedAt(integration.getUpdatedAt())
            .build();
    }

    public List<IntegrationResponse> toResponseList(List<Integration> integrations) {
        return integrations.stream().map(this::toResponse).toList();
    }
}
