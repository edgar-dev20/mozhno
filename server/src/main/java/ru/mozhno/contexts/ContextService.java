package ru.mozhno.contexts;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContextService {
    private final ContextDefinitionRepository contextDefinitionRepository;
    private final ContextValueRepository contextValueRepository;

    public ContextService(ContextDefinitionRepository contextDefinitionRepository, ContextValueRepository contextValueRepository) {
        this.contextDefinitionRepository = contextDefinitionRepository;
        this.contextValueRepository = contextValueRepository;
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
        return contextDefinitionRepository.save(definition);
    }

    @Transactional
    public ContextDefinition createDefinition(ContextDefinitionRequest request) {
        ContextDefinition definition = new ContextDefinition();
        definition.setName(request.getName());
        definition.setDescription(request.getDescription());
        definition.setProjectId(request.getProjectId());
        return contextDefinitionRepository.save(definition);
    }

    @Transactional
    public void deleteDefinition(Integer id) {
        contextDefinitionRepository.deleteById(id);
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
        return contextValueRepository.save(value);
    }

    @Transactional
    public ContextValue createValue(ContextValueRequest request) {
        ContextValue value = new ContextValue();
        value.setContextDefinitionId(request.getContextDefinitionId());
        value.setValues(request.getValues());
        return contextValueRepository.save(value);
    }

    @Transactional
    public void deleteValue(Integer id) {
        contextValueRepository.deleteById(id);
    }
}