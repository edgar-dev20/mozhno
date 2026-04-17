package dev.mozhno.contexts;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ContextAssembler {

    public ContextDefinitionResponse toDefinitionResponse(ContextDefinition def) {
        return ContextDefinitionResponse.builder()
            .id(def.getId())
            .name(def.getName())
            .contextKey(def.getContextKey())
            .contextType(def.getContextType())
            .createdBy(def.getCreatedBy())
            .description(def.getDescription())
            .projectId(def.getProjectId())
            .createdAt(def.getCreatedAt())
            .build();
    }

    public List<ContextDefinitionResponse> toDefinitionResponseList(List<ContextDefinition> defs) {
        return defs.stream().map(this::toDefinitionResponse).toList();
    }

    public ContextValueResponse toValueResponse(ContextValue value) {
        return ContextValueResponse.builder()
            .id(value.getId())
            .contextDefinitionId(value.getContextDefinitionId())
            .values(value.getValues())
            .createdAt(value.getCreatedAt())
            .build();
    }

    public List<ContextValueResponse> toValueResponseList(List<ContextValue> values) {
        return values.stream().map(this::toValueResponse).toList();
    }
}
