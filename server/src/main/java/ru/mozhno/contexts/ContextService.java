package ru.mozhno.contexts;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.events.DomainEvent;
import ru.mozhno.events.DomainEventPublisher;

import java.util.List;

@Service
public class ContextService {
    private final ContextDefinitionRepository contextDefinitionRepository;
    private final ContextValueRepository contextValueRepository;
    private final DomainEventPublisher events;

    public ContextService(ContextDefinitionRepository contextDefinitionRepository,
                          ContextValueRepository contextValueRepository,
                          DomainEventPublisher events) {
        this.contextDefinitionRepository = contextDefinitionRepository;
        this.contextValueRepository = contextValueRepository;
        this.events = events;
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
    public ContextDefinition updateDefinition(Integer id, ContextDefinitionRequest request) {
        ContextDefinition definition = contextDefinitionRepository.findById(id);
        if (definition == null) throw new RuntimeException("ContextDefinition not found: " + id);
        definition.setName(request.getName());
        definition.setDescription(request.getDescription());
        ContextDefinition saved = contextDefinitionRepository.save(definition);
        events.publish(new DomainEvent(saved.getProjectId(), "context_definition.updated", "context",
            saved.getId(), saved.getName(), "Context definition updated"));
        return saved;
    }

    @Transactional
    public ContextDefinition createDefinition(ContextDefinitionRequest request) {
        ContextDefinition definition = new ContextDefinition();
        definition.setName(request.getName());
        definition.setDescription(request.getDescription());
        definition.setProjectId(request.getProjectId());
        ContextDefinition saved = contextDefinitionRepository.save(definition);
        events.publish(new DomainEvent(saved.getProjectId(), "context_definition.created", "context",
            saved.getId(), saved.getName(), "Context definition created"));
        return saved;
    }

    @Transactional
    public void deleteDefinition(Integer id) {
        ContextDefinition def = contextDefinitionRepository.findById(id);
        String name = def != null ? def.getName() : String.valueOf(id);
        Integer projectId = def != null ? def.getProjectId() : null;
        contextDefinitionRepository.deleteById(id);
        events.publish(new DomainEvent(projectId, "context_definition.deleted", "context",
            id, name, "Context definition deleted"));
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