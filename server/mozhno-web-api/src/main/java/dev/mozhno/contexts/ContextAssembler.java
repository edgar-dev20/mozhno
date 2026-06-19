package dev.mozhno.contexts;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class ContextAssembler {

    public ContextDefinitionResponse toDefinitionResponse(ContextDefinition def) {
        return toDefinitionResponse(def, Collections.emptyList());
    }

    public ContextDefinitionResponse toDefinitionResponse(ContextDefinition def, List<String> validValues) {
        return ContextDefinitionResponse.builder()
            .id(def.getId())
            .name(def.getName())
            .contextKey(def.getContextKey())
            .contextType(def.getContextType())
            .createdBy(def.getCreatedBy())
            .description(def.getDescription())
            .isStrict(def.isStrict())
            .validValues(validValues)
            .projectId(def.getProjectId())
            .createdAt(def.getCreatedAt())
            .build();
    }

    public List<ContextDefinitionResponse> toDefinitionResponseList(List<ContextDefinition> defs) {
        return defs.stream().map(this::toDefinitionResponse).toList();
    }

    public List<ContextDefinitionResponse> toDefinitionResponseList(List<ContextDefinition> defs, Map<Integer, List<String>> valuesByDef) {
        return defs.stream()
            .map(d -> toDefinitionResponse(d, valuesByDef.getOrDefault(d.getId(), Collections.emptyList())))
            .toList();
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
