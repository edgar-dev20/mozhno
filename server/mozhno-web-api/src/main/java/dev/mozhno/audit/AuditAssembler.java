package dev.mozhno.audit;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuditAssembler {

    public AuditEventResponse toResponse(AuditEvent event) {
        return AuditEventResponse.builder()
            .id(event.getId())
            .projectId(event.getProjectId())
            .userId(event.getUserId())
            .userName(event.getUserName())
            .userEmail(event.getUserEmail())
            .action(event.getAction())
            .resourceType(event.getResourceType())
            .resourceId(event.getResourceId())
            .resourceName(event.getResourceName())
            .details(event.getDetails())
            .ipAddress(event.getIpAddress())
            .createdAt(event.getCreatedAt())
            .build();
    }

    public List<AuditEventResponse> toResponseList(List<AuditEvent> events) {
        return events.stream().map(this::toResponse).toList();
    }
}
