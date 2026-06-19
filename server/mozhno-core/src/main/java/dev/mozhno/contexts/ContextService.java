package dev.mozhno.contexts;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.ContextType;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.segments.SegmentContextRepository;
import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.NotFoundException;

import java.util.stream.Collectors;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Service for managing context definitions and their values.
 * Contexts are used for targeting rules in segments and strategies.
 */
@Service
public class ContextService {
    private final ContextDefinitionRepository contextDefinitionRepository;
    private final ContextValueRepository contextValueRepository;
    private final SegmentContextRepository segmentContextRepository;
    private final DomainEventPublisher events;
    private final QuotaSpi quotaSpi;

    public ContextService(ContextDefinitionRepository contextDefinitionRepository,
                          ContextValueRepository contextValueRepository,
                          SegmentContextRepository segmentContextRepository,
                          DomainEventPublisher events, QuotaSpi quotaSpi) {
        this.contextDefinitionRepository = contextDefinitionRepository;
        this.contextValueRepository = contextValueRepository;
        this.segmentContextRepository = segmentContextRepository;
        this.events = events;
        this.quotaSpi = quotaSpi;
    }

    /**
     * Returns all context definitions for a project.
     *
     * @param projectId the project ID
     * @return list of context definitions
     */
    @Transactional(readOnly = true)
    public List<ContextDefinition> findDefinitionsByProjectId(Integer projectId) {
        return contextDefinitionRepository.findByProjectId(projectId);
    }

    /**
     * Finds a context definition by its ID.
     *
     * @param id the context definition ID
     * @return the context definition
     * @throws RuntimeException if not found
     */
    @Transactional(readOnly = true)
    public ContextDefinition findDefinitionById(Integer id, Integer projectId) {
        ContextDefinition def;
        if (projectId != null) {
            def = contextDefinitionRepository.findByIdAndProjectId(id, projectId);
        } else {
            def = contextDefinitionRepository.findById(id);
        }
        if (def == null) throw new NotFoundException("ContextDefinition", id);
        return def;
    }

    /**
     * Creates a context definition.
     *
     * @param request the context definition request
     * @param createdBy the username of the creator, may be null
     * @return the created context definition
     * @throws RuntimeException if the context quota is exceeded
     */
    @Transactional
    public ContextDefinition createDefinition(ContextDefinitionRequest request, String createdBy) {
        dev.mozhno.util.QuotaValidator.check(quotaSpi.canCreateContext(request.getProjectId()));

        ContextDefinition definition = new ContextDefinition();
        definition.setProjectId(request.getProjectId());
        definition.setName(request.getName());
        definition.setContextKey(request.getKey());
        definition.setContextType(ContextType.fromValue(request.getType()).getValue());
        definition.setCreatedBy(createdBy);
        definition.setDescription(request.getDescription());
        if (request.getIsStrict() != null) definition.setStrict(request.getIsStrict());
        ContextDefinition saved = contextDefinitionRepository.save(definition);
        events.publish(DomainEvent.of(saved.getProjectId(), "context_definition.created", "context",
            saved.getId(), saved.getName(), "Context definition created"));
        return saved;
    }

    /**
     * Updates a context definition.
     *
     * @param id the context definition ID
     * @param request the context definition update request
     * @return the updated context definition
     * @throws RuntimeException if not found
     */
    @Transactional
    public ContextDefinition updateDefinition(Integer id, ContextDefinitionRequest request) {
        ContextDefinition definition;
        if (request.getProjectId() != null) {
            definition = contextDefinitionRepository.findByIdAndProjectId(id, request.getProjectId());
        } else {
            definition = contextDefinitionRepository.findById(id);
        }
        if (definition == null) throw new NotFoundException("ContextDefinition", id);
        definition.setName(request.getName());
        definition.setContextKey(request.getKey());
        definition.setContextType(ContextType.fromValue(request.getType()).getValue());
        definition.setDescription(request.getDescription());
        if (request.getIsStrict() != null) definition.setStrict(request.getIsStrict());
        ContextDefinition saved = contextDefinitionRepository.save(definition);
        events.publish(DomainEvent.of(saved.getProjectId(), "context_definition.updated", "context",
            saved.getId(), saved.getName(), "Context definition updated"));
        return saved;
    }

    /**
     * Deletes a context definition. Fails if the context is still referenced by any segment.
     *
     * @param id the context definition ID
     * @throws RuntimeException if not found or still used by segments
     */
    @Transactional
    public void deleteDefinition(Integer id, Integer projectId) {
        if (segmentContextRepository.existsByContextDefinitionId(id)) {
            throw new BadRequestException("Cannot delete context: it is used by segments");
        }
        int deleted = contextDefinitionRepository.deleteById(id, projectId);
        if (deleted == 0) throw new NotFoundException("ContextDefinition", id);
        events.publish(DomainEvent.of(projectId, "context_definition.deleted", "context",
            id, null, "Context definition deleted"));
    }

    /**
     * Returns all context values for a given context definition.
     *
     * @param contextDefinitionId the context definition ID
     * @return list of context values
     */
    @Transactional(readOnly = true)
    public List<ContextValue> findValuesByContextDefinitionId(Integer contextDefinitionId, Integer projectId) {
        ContextDefinition def;
        if (projectId != null) {
            def = contextDefinitionRepository.findByIdAndProjectId(contextDefinitionId, projectId);
        } else {
            def = contextDefinitionRepository.findById(contextDefinitionId);
        }
        if (def == null) throw new NotFoundException("ContextDefinition", contextDefinitionId);
        return contextValueRepository.findByContextDefinitionId(contextDefinitionId);
    }

    @Transactional(readOnly = true)
    public ContextValue findValueById(Integer id, Integer projectId) {
        ContextValue value = contextValueRepository.findById(id);
        if (value == null) throw new NotFoundException("ContextValue", id);
        if (projectId != null) {
            ContextDefinition def = contextDefinitionRepository.findByIdAndProjectId(value.getContextDefinitionId(), projectId);
            if (def == null) throw new NotFoundException("ContextValue", id);
        }
        return value;
    }

    @Transactional(readOnly = true)
    public Map<Integer, List<String>> findValuesByDefinitionIds(Set<Integer> definitionIds) {
        return contextValueRepository.findValuesByDefinitionIds(definitionIds);
    }

    @Transactional
    public ContextValue updateValue(Integer id, ContextValueRequest request, Integer projectId) {
        ContextValue value = contextValueRepository.findById(id);
        if (value == null) throw new NotFoundException("ContextValue", id);
        if (projectId != null) {
            ContextDefinition def = contextDefinitionRepository.findByIdAndProjectId(value.getContextDefinitionId(), projectId);
            if (def == null) throw new NotFoundException("ContextValue", id);
        }
        value.setValues(request.getValues());
        ContextValue saved = contextValueRepository.save(value);
        ContextDefinition eventDef = contextDefinitionRepository.findById(saved.getContextDefinitionId());
        if (eventDef != null) {
            events.publish(DomainEvent.of(eventDef.getProjectId(), "context_value.updated", "context",
                saved.getId(), eventDef.getName(), "Context value updated"));
        }
        return saved;
    }

    @Transactional
    public ContextValue createValue(ContextValueRequest request, Integer projectId) {
        if (projectId != null) {
            ContextDefinition def = contextDefinitionRepository.findByIdAndProjectId(request.getContextDefinitionId(), projectId);
            if (def == null) throw new NotFoundException("ContextDefinition", request.getContextDefinitionId());
        }
        ContextValue value = new ContextValue();
        value.setContextDefinitionId(request.getContextDefinitionId());
        value.setValues(request.getValues());
        ContextValue saved = contextValueRepository.save(value);
        ContextDefinition eventDef = contextDefinitionRepository.findById(saved.getContextDefinitionId());
        if (eventDef != null) {
            events.publish(DomainEvent.of(eventDef.getProjectId(), "context_value.created", "context",
                saved.getId(), eventDef.getName(), "Context value created"));
        }
        return saved;
    }

    @Transactional
    public void upsertValues(Integer contextDefinitionId, String values, Integer projectId) {
        if (projectId != null) {
            ContextDefinition def = contextDefinitionRepository.findByIdAndProjectId(contextDefinitionId, projectId);
            if (def == null) throw new NotFoundException("ContextDefinition", contextDefinitionId);
        }
        contextValueRepository.deleteByDefinitionId(contextDefinitionId);
        if (values != null && !values.isBlank()) {
            ContextValue cv = new ContextValue();
            cv.setContextDefinitionId(contextDefinitionId);
            cv.setValues(values);
            contextValueRepository.save(cv);
        }
    }

    /**
     * Deletes a context value by its ID.
     *
     * @param id the context value ID
     * @throws NotFoundException if the value does not exist
     */
    @Transactional
    public void deleteValue(Integer id, Integer projectId) {
        ContextValue value = contextValueRepository.findById(id);
        if (value == null) throw new NotFoundException("ContextValue", id);
        if (projectId != null) {
            var def = contextDefinitionRepository.findByIdAndProjectId(value.getContextDefinitionId(), projectId);
            if (def == null) throw new NotFoundException("ContextValue", id);
            events.publish(DomainEvent.of(def.getProjectId(), "context_value.deleted", "context",
                id, def.getName(), "Context value deleted"));
        } else {
            var def = contextDefinitionRepository.findById(value.getContextDefinitionId());
            if (def != null) {
                events.publish(DomainEvent.of(def.getProjectId(), "context_value.deleted", "context",
                    id, def.getName(), "Context value deleted"));
            }
        }
        contextValueRepository.deleteById(id);
    }

    /**
     * Validates that the given value(s) are in the whitelist for a strict context definition.
     *
     * @param contextDefinitionId the context definition ID
     * @param values comma-separated or single values to validate
     * @throws BadRequestException if the context is strict and a value is not in the whitelist
     */
    @Transactional(readOnly = true)
    public void validateStrictValues(Integer contextDefinitionId, String values) {
        ContextDefinition def = contextDefinitionRepository.findById(contextDefinitionId);
        if (def == null || !def.isStrict()) return;
        List<String> allowed = contextValueRepository.findByContextDefinitionId(contextDefinitionId)
            .stream()
            .flatMap(cv -> {
                String v = cv.getValues();
                if (v == null || v.isBlank()) return java.util.stream.Stream.empty();
                return java.util.stream.Stream.of(v.split("\\s*,\\s*"));
            })
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
        if (allowed.isEmpty()) return;
        if (values == null || values.isBlank()) return;
        String[] parts = values.split("\\s*,\\s*");
        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) continue;
            if (!allowed.contains(trimmed)) {
                throw new BadRequestException("Value '" + trimmed + "' is not in the whitelist for context '" + def.getName() + "'");
            }
        }
    }

    @Transactional(readOnly = true)
    public void validateStrictValues(Map<Integer, String> valuesByDefId) {
        if (valuesByDefId == null || valuesByDefId.isEmpty()) return;
        Set<Integer> defIds = valuesByDefId.keySet();
        Map<Integer, ContextDefinition> defs = contextDefinitionRepository.findByIds(defIds);
        List<Integer> strictIds = defs.values().stream()
            .filter(ContextDefinition::isStrict)
            .map(ContextDefinition::getId)
            .toList();
        if (strictIds.isEmpty()) return;
        Map<Integer, List<String>> allowedByDef = contextValueRepository.findValuesByDefinitionIds(new HashSet<>(strictIds));
        for (Map.Entry<Integer, String> entry : valuesByDefId.entrySet()) {
            Integer defId = entry.getKey();
            if (!strictIds.contains(defId)) continue;
            String values = entry.getValue();
            if (values == null || values.isBlank()) continue;
            List<String> allowed = allowedByDef.getOrDefault(defId, List.of());
            if (allowed.isEmpty()) continue;
            String[] parts = values.split("\\s*,\\s*");
            for (String part : parts) {
                String trimmed = part.trim();
                if (trimmed.isEmpty()) continue;
                if (!allowed.contains(trimmed)) {
                    ContextDefinition def = defs.get(defId);
                    String name = def != null ? def.getName() : String.valueOf(defId);
                    throw new BadRequestException("Value '" + trimmed + "' is not in the whitelist for context '" + name + "'");
                }
            }
        }
    }
}