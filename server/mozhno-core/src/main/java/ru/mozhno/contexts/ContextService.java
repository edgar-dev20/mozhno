package ru.mozhno.contexts;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.events.DomainEvent;
import ru.mozhno.events.DomainEventPublisher;
import ru.mozhno.segments.SegmentContextRepository;
import ru.mozhno.spi.QuotaSpi;

import java.util.List;

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

    @Transactional(readOnly = true)
    public List<ContextDefinition> findDefinitionsByProjectId(Integer projectId) {
        return contextDefinitionRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public ContextDefinition findDefinitionById(Integer id) {
        ContextDefinition def = contextDefinitionRepository.findById(id);
        if (def == null) throw new RuntimeException("ContextDefinition not found: " + id);
        return def;
    }

    @Transactional
    public ContextDefinition createDefinition(ContextDefinitionRequest request) {
        return createDefinition(request, null);
    }

    public ContextDefinition createDefinition(ContextDefinitionRequest request, String createdBy) {
        QuotaSpi.QuotaResult quota = quotaSpi.canCreateContext(request.getProjectId());
        if (quota instanceof QuotaSpi.Blocked blocked) {
            throw new RuntimeException(
                String.format("Context limit reached: %d/%d (%s plan). Upgrade to create more.",
                    blocked.current(), blocked.limit(), blocked.planName()));
        }

        ContextDefinition definition = new ContextDefinition();
        definition.setProjectId(request.getProjectId());
        definition.setName(request.getName());
        definition.setContextKey(request.getKey());
        definition.setContextType(request.getType() != null ? request.getType() : "string");
        definition.setCreatedBy(createdBy);
        definition.setDescription(request.getDescription());
        ContextDefinition saved = contextDefinitionRepository.save(definition);
        events.publish(new DomainEvent(saved.getProjectId(), "context_definition.created", "context",
            saved.getId(), saved.getName(), "Context definition created"));
        return saved;
    }

    @Transactional
    public ContextDefinition updateDefinition(Integer id, ContextDefinitionRequest request) {
        ContextDefinition definition = contextDefinitionRepository.findById(id);
        if (definition == null) throw new RuntimeException("ContextDefinition not found: " + id);
        definition.setName(request.getName());
        definition.setContextKey(request.getKey());
        definition.setContextType(request.getType() != null ? request.getType() : "string");
        definition.setDescription(request.getDescription());
        ContextDefinition saved = contextDefinitionRepository.save(definition);
        events.publish(new DomainEvent(saved.getProjectId(), "context_definition.updated", "context",
            saved.getId(), saved.getName(), "Context definition created"));
        return saved;
    }

    @Transactional
    public void deleteDefinition(Integer id) {
        ContextDefinition def = contextDefinitionRepository.findById(id);
        if (def == null) throw new RuntimeException("ContextDefinition not found: " + id);
        if (segmentContextRepository.existsByContextDefinitionId(id)) {
            throw new RuntimeException("Cannot delete context: it is used by segments");
        }
        contextDefinitionRepository.deleteById(id);
        events.publish(new DomainEvent(def.getProjectId(), "context_definition.deleted", "context",
            id, def.getName(), "Context definition deleted"));
    }

    @Transactional(readOnly = true)
    public List<ContextValue> findValuesByContextDefinitionId(Integer contextDefinitionId) {
        return contextValueRepository.findByContextDefinitionId(contextDefinitionId);
    }

    @Transactional(readOnly = true)
    public ContextValue findValueById(Integer id) {
        ContextValue value = contextValueRepository.findById(id);
        if (value == null) throw new RuntimeException("ContextValue not found: " + id);
        return value;
    }

    @Transactional
    public ContextValue updateValue(Integer id, ContextValueRequest request) {
        ContextValue value = contextValueRepository.findById(id);
        if (value == null) throw new RuntimeException("ContextValue not found: " + id);
        value.setValues(request.getValues());
        ContextValue saved = contextValueRepository.save(value);
        var def = contextDefinitionRepository.findById(saved.getContextDefinitionId());
        if (def != null) {
            events.publish(new DomainEvent(def.getProjectId(), "context_value.updated", "context",
                saved.getId(), def.getName(), "Context value updated"));
        }
        return saved;
    }

    @Transactional
    public ContextValue createValue(ContextValueRequest request) {
        ContextValue value = new ContextValue();
        value.setContextDefinitionId(request.getContextDefinitionId());
        value.setValues(request.getValues());
        ContextValue saved = contextValueRepository.save(value);
        var def = contextDefinitionRepository.findById(saved.getContextDefinitionId());
        if (def != null) {
            events.publish(new DomainEvent(def.getProjectId(), "context_value.created", "context",
                saved.getId(), def.getName(), "Context value created"));
        }
        return saved;
    }

    @Transactional
    public void deleteValue(Integer id) {
        ContextValue value = contextValueRepository.findById(id);
        if (value != null) {
            var def = contextDefinitionRepository.findById(value.getContextDefinitionId());
            if (def != null) {
                events.publish(new DomainEvent(def.getProjectId(), "context_value.deleted", "context",
                    id, def.getName(), "Context value deleted"));
            }
        }
        contextValueRepository.deleteById(id);
    }
}