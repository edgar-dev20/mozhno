package dev.mozhno.contexts;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.segments.SegmentContextRepository;
import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.NotFoundException;
import dev.mozhno.exception.QuotaExceededException;

import java.util.List;

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

    @Transactional(readOnly = true)
    public ContextDefinition findDefinitionById(Integer id) {
        return findDefinitionById(id, null);
    }

    /**
     * Creates a context definition with no explicit creator.
     *
     * @param request the context definition request
     * @return the created context definition
     */
    @Transactional
    public ContextDefinition createDefinition(ContextDefinitionRequest request) {
        return createDefinition(request, null);
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
        QuotaSpi.QuotaResult quota = quotaSpi.canCreateContext(request.getProjectId());
        if (quota instanceof QuotaSpi.Blocked blocked) {
            throw new QuotaExceededException(blocked.current(), blocked.limit(), blocked.planName());
        }

        ContextDefinition definition = new ContextDefinition();
        definition.setProjectId(request.getProjectId());
        definition.setName(request.getName());
        definition.setContextKey(request.getKey());
        definition.setContextType(request.getType() != null ? request.getType() : "string");
        definition.setCreatedBy(createdBy);
        definition.setDescription(request.getDescription());
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
        definition.setContextType(request.getType() != null ? request.getType() : "string");
        definition.setDescription(request.getDescription());
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

    @Transactional
    public void deleteDefinition(Integer id) {
        deleteDefinition(id, null);
    }

    /**
     * Returns all context values for a given context definition.
     *
     * @param contextDefinitionId the context definition ID
     * @return list of context values
     */
    @Transactional(readOnly = true)
    public List<ContextValue> findValuesByContextDefinitionId(Integer contextDefinitionId, Integer projectId) {
        ContextDefinition def = contextDefinitionRepository.findByIdAndProjectId(contextDefinitionId, projectId);
        if (def == null) throw new NotFoundException("ContextDefinition", contextDefinitionId);
        return contextValueRepository.findByContextDefinitionId(contextDefinitionId);
    }

    @Transactional(readOnly = true)
    public List<ContextValue> findValuesByContextDefinitionId(Integer contextDefinitionId) {
        return contextValueRepository.findByContextDefinitionId(contextDefinitionId);
    }

    /**
     * Finds a context value by its ID.
     *
     * @param id the context value ID
     * @return the context value
     * @throws RuntimeException if not found
     */
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
    public ContextValue findValueById(Integer id) {
        return findValueById(id, null);
    }

    /**
     * Updates a context value.
     *
     * @param id the context value ID
     * @param request the context value update request
     * @return the updated context value
     * @throws RuntimeException if not found
     */
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
    public ContextValue updateValue(Integer id, ContextValueRequest request) {
        return updateValue(id, request, null);
    }

    /**
     * Creates a new context value.
     *
     * @param request the context value creation request
     * @return the created context value
     */
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

    public ContextValue createValue(ContextValueRequest request) {
        return createValue(request, null);
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

    @Transactional
    public void deleteValue(Integer id) {
        deleteValue(id, null);
    }
}