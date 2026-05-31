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
        FlagStrategy strategy = switch (request.getType().toUpperCase()) {
            case "SERVER" -> {
                ServerStrategy s = new ServerStrategy();
                s.setEnabled(request.getEnabled());
                yield s;
            }
            case "GRADUAL" -> {
                GradualStrategy s = new GradualStrategy();
                s.setEnabled(request.getEnabled());
                s.setPercentage(request.getPercentage());
                yield s;
            }
            case "TARGETING" -> {
                TargetingStrategy s = new TargetingStrategy();
                s.setEnabled(request.getEnabled());
                s.setContextDefinitionId(request.getContextDefinitionId());
                s.setContextValuesJson(request.getContextValuesJson());
                s.setRolloutPercentage(request.getRolloutPercentage());
                s.setSegmentId(request.getSegmentId());
                yield s;
            }
            default -> throw new RuntimeException("Unknown strategy type: " + request.getType());
        };
        strategy.setFlagId(request.getFlagId());
        strategy.setEnvironmentId(request.getEnvironmentId());
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
        if (!existing.getStrategyType().equalsIgnoreCase(request.getType())) {
            strategyRepository.deleteById(id);
            request.setFlagId(existing.getFlagId());
            request.setEnvironmentId(existing.getEnvironmentId());
            return create(request);
        }
        existing.setEnabled(request.getEnabled());
        if ("GRADUAL".equalsIgnoreCase(existing.getStrategyType())) {
            existing.setPercentage(request.getPercentage());
        } else if ("TARGETING".equalsIgnoreCase(existing.getStrategyType())) {
            existing.setContextDefinitionId(request.getContextDefinitionId());
            existing.setContextValuesJson(request.getContextValuesJson());
            existing.setRolloutPercentage(request.getRolloutPercentage());
            existing.setSegmentId(request.getSegmentId());
        }
        return strategyRepository.save(existing);
    }
}