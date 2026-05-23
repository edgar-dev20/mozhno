package ru.mozhno.flags.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.flags.FlagRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StrategyService {
    private final FlagStrategyRepository strategyRepository;
    private final FlagRepository flagRepository;

    @Transactional(readOnly = true)
    public List<FlagStrategy> findByFlagId(Integer flagId) {
        flagRepository.findById(flagId)
                .orElseThrow(() -> new RuntimeException("Flag not found: " + flagId));
        return strategyRepository.findByFlagId(flagId);
    }

    @Transactional(readOnly = true)
    public FlagStrategy findByFlagIdAndEnvironmentId(Integer flagId, Integer environmentId) {
        return strategyRepository.findByFlagIdAndEnvironmentId(flagId, environmentId);
    }

    @Transactional
    public FlagStrategy create(StrategyRequest request) {
        var flag = flagRepository.findById(request.getFlagId())
                .orElseThrow(() -> new RuntimeException("Flag not found: " + request.getFlagId()));
        FlagStrategy strategy = switch (request.getType().toUpperCase()) {
            case "SERVER" -> {
                var s = new ServerStrategy();
                s.setEnabled(request.getEnabled());
                yield s;
            }
            case "GRADUAL" -> {
                var s = new GradualStrategy();
                s.setEnabled(request.getEnabled());
                s.setPercentage(request.getPercentage());
                yield s;
            }
            case "TARGETING" -> {
                var s = new TargetingStrategy();
                s.setEnabled(request.getEnabled());
                s.setContextDefinitionId(request.getContextDefinitionId());
                s.setContextValuesJson(request.getContextValuesJson());
                s.setRolloutPercentage(request.getRolloutPercentage());
                yield s;
            }
            default -> throw new RuntimeException("Unknown strategy type: " + request.getType());
        };
        strategy.setFlag(flag);
        strategy.setEnvironmentId(request.getEnvironmentId());
        return strategyRepository.save(strategy);
    }

    @Transactional
    public void delete(Integer id) {
        strategyRepository.deleteById(id);
    }

    @Transactional
    public FlagStrategy update(Integer id, StrategyRequest request) {
        var strategy = strategyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Strategy not found: " + id));
        strategy.setEnabled(request.getEnabled());
        if (strategy instanceof GradualStrategy gs) {
            gs.setPercentage(request.getPercentage());
        } else if (strategy instanceof TargetingStrategy ts) {
            ts.setContextDefinitionId(request.getContextDefinitionId());
            ts.setContextValuesJson(request.getContextValuesJson());
            ts.setRolloutPercentage(request.getRolloutPercentage());
        }
        return strategyRepository.save(strategy);
    }
}