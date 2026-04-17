package dev.mozhno.flags.strategy;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StrategyAssembler {

    public FlagStrategyResponse toResponse(FlagStrategy strategy) {
        return FlagStrategyResponse.builder()
            .id(strategy.getId())
            .flagId(strategy.getFlagId())
            .environmentId(strategy.getEnvironmentId())
            .enabled(strategy.isEnabled())
            .percentage(strategy.getPercentage())
            .contextDefinitionId(strategy.getContextDefinitionId())
            .contextName(strategy.getContextName())
            .contextValuesJson(strategy.getContextValuesJson())
            .segmentIds(strategy.getSegmentIds())
            .environmentName(strategy.getEnvironmentName())
            .createdAt(strategy.getCreatedAt())
            .lastUsedAt(strategy.getLastUsedAt())
            .build();
    }

    public List<FlagStrategyResponse> toResponseList(List<FlagStrategy> strategies) {
        return strategies.stream().map(this::toResponse).toList();
    }
}
