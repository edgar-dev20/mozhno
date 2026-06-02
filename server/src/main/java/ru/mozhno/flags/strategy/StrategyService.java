package ru.mozhno.flags.strategy;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.flags.FlagRepository;

import java.util.List;

@Service
public class StrategyService {
    private final FlagStrategyRepository strategyRepository;
    private final FlagRepository flagRepository;

    public StrategyService(FlagStrategyRepository strategyRepository, FlagRepository flagRepository) {
        this.strategyRepository = strategyRepository;
        this.flagRepository = flagRepository;
    }

    @Transactional(readOnly = true)
    public List<FlagStrategy> findByFlagId(Integer flagId) {
        if (flagRepository.findById(flagId) == null) {
            throw new RuntimeException("Flag not found: " + flagId);
        }
        return strategyRepository.findByFlagId(flagId);
    }

    @Transactional(readOnly = true)
    public FlagStrategy findByFlagIdAndEnvironmentId(Integer flagId, Integer environmentId) {
        return strategyRepository.findByFlagIdAndEnvironmentId(flagId, environmentId);
    }

    @Transactional
    public FlagStrategy create(StrategyRequest request) {
        if (flagRepository.findById(request.getFlagId()) == null) {
            throw new RuntimeException("Flag not found: " + request.getFlagId());
        }
        FlagStrategy strategy = new FlagStrategy();
        strategy.setFlagId(request.getFlagId());
        strategy.setEnvironmentId(request.getEnvironmentId());
        strategy.setEnabled(request.getEnabled() != null ? request.getEnabled() : false);
        strategy.setPercentage(request.getPercentage());
        strategy.setContextDefinitionId(request.getContextDefinitionId());
        strategy.setContextValuesJson(request.getContextValuesJson());
        strategy.setSegmentId(request.getSegmentId());
        return strategyRepository.save(strategy);
    }

    @Transactional
    public void delete(Integer id) {
        strategyRepository.deleteById(id);
    }

    @Transactional
    public FlagStrategy update(Integer id, StrategyRequest request) {
        FlagStrategy existing = strategyRepository.findById(id);
        if (existing == null) throw new RuntimeException("Strategy not found: " + id);
        existing.setEnabled(request.getEnabled() != null ? request.getEnabled() : existing.isEnabled());
        existing.setPercentage(request.getPercentage());
        existing.setContextDefinitionId(request.getContextDefinitionId());
        existing.setContextValuesJson(request.getContextValuesJson());
        existing.setSegmentId(request.getSegmentId());
        return strategyRepository.save(existing);
    }

    @Transactional
    public FlagStrategy upsert(StrategyRequest request) {
        FlagStrategy existing = strategyRepository.findByFlagIdAndEnvironmentId(request.getFlagId(), request.getEnvironmentId());
        if (existing != null) {
            existing.setEnabled(request.getEnabled() != null ? request.getEnabled() : existing.isEnabled());
            existing.setPercentage(request.getPercentage());
            existing.setContextDefinitionId(request.getContextDefinitionId());
            existing.setContextValuesJson(request.getContextValuesJson());
            existing.setSegmentId(request.getSegmentId());
            return strategyRepository.save(existing);
        }
        return create(request);
    }
}