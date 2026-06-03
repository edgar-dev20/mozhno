package ru.mozhno.flags.strategy;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.mozhno.events.DomainEvent;
import ru.mozhno.events.DomainEventPublisher;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagRepository;

import java.util.List;

@Service
public class StrategyService {
    private final FlagStrategyRepository strategyRepository;
    private final FlagRepository flagRepository;
    private final DomainEventPublisher events;

    public StrategyService(FlagStrategyRepository strategyRepository, FlagRepository flagRepository,
                           DomainEventPublisher events) {
        this.strategyRepository = strategyRepository;
        this.flagRepository = flagRepository;
        this.events = events;
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
        Flag flag = flagRepository.findById(request.getFlagId());
        if (flag == null) {
            throw new RuntimeException("Flag not found: " + request.getFlagId());
        }
        FlagStrategy saved = strategyRepository.upsert(
            request.getFlagId(),
            request.getEnvironmentId(),
            request.getEnabled() != null ? request.getEnabled() : false,
            request.getPercentage(),
            request.getContextDefinitionId(),
            request.getContextValuesJson(),
            request.getSegmentId()
        );
        events.publish(new DomainEvent(flag.getProjectId(), "strategy.created", "strategy",
            saved.getId(), flag.getName(), "Strategy created for env " + request.getEnvironmentId()));
        return saved;
    }

    @Transactional
    public void delete(Integer id) {
        strategyRepository.deleteById(id);
    }

    @Transactional
    public FlagStrategy update(Integer id, StrategyRequest request) {
        FlagStrategy existing = strategyRepository.findById(id);
        if (existing == null) throw new RuntimeException("Strategy not found: " + id);

        FlagStrategy saved = strategyRepository.updateById(
            id,
            request.getEnabled() != null ? request.getEnabled() : existing.isEnabled(),
            request.getPercentage(),
            request.getContextDefinitionId(),
            request.getContextValuesJson(),
            request.getSegmentId()
        );
        if (saved == null) throw new RuntimeException("Strategy not found: " + id);

        var flag = flagRepository.findById(existing.getFlagId());
        if (flag != null) {
            events.publish(new DomainEvent(flag.getProjectId(), "strategy.updated", "strategy",
                saved.getId(), flag.getName(), "Strategy updated for env " + existing.getEnvironmentId()));
        }
        return saved;
    }

    @Transactional
    public FlagStrategy upsert(StrategyRequest request) {
        Flag flag = flagRepository.findById(request.getFlagId());
        if (flag == null) {
            throw new RuntimeException("Flag not found: " + request.getFlagId());
        }

        FlagStrategy saved = strategyRepository.upsert(
            request.getFlagId(),
            request.getEnvironmentId(),
            request.getEnabled() != null ? request.getEnabled() : false,
            request.getPercentage(),
            request.getContextDefinitionId(),
            request.getContextValuesJson(),
            request.getSegmentId()
        );

        events.publish(new DomainEvent(flag.getProjectId(), "strategy.created", "strategy",
            saved.getId(), flag.getName(), "Strategy upserted for env " + request.getEnvironmentId()));
        return saved;
    }
}