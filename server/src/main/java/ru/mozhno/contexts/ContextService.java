package ru.mozhno.contexts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContextService {
    private final ContextDefinitionRepository contextDefinitionRepository;
    private final ContextValueRepository contextValueRepository;

    @Transactional(readOnly = true)
    public List<ContextDefinition> findDefinitionsByProjectId(Integer projectId) {
        return contextDefinitionRepository.findByProjectId(projectId);
    }

    @Transactional
    public ContextDefinition createDefinition(ContextDefinitionRequest request) {
        var definition = new ContextDefinition();
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

    @Transactional
    public ContextValue createValue(ContextValueRequest request) {
        var value = new ContextValue();
        value.setContextDefinitionId(request.getContextDefinitionId());
        value.setValues(request.getValues());
        return contextValueRepository.save(value);
    }

    @Transactional
    public void deleteValue(Integer id) {
        contextValueRepository.deleteById(id);
    }
}