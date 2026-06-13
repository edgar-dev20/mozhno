package dev.mozhno.client;

import dev.mozhno.contexts.ContextDefinition;
import dev.mozhno.contexts.ContextDefinitionRepository;
import org.springframework.stereotype.Service;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagRepository;
import dev.mozhno.flags.FlagWithStrategy;
import dev.mozhno.flags.strategy.FlagStrategy;
import dev.mozhno.flags.strategy.FlagStrategyRepository;
import dev.mozhno.metrics.FlagMetricRepository;
import dev.mozhno.segments.SegmentContextRepository;
import dev.mozhno.segments.SegmentContextRepository.SegmentContextWithName;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static dev.mozhno.client.FlagConstraintParser.parseStrategyConstraints;

@Service
public class ClientFlagService {
    private final FlagRepository flagRepository;
    private final FlagStrategyRepository flagStrategyRepository;
    private final SegmentContextRepository segmentContextRepository;
    private final ContextDefinitionRepository contextDefinitionRepository;
    private final FlagMetricRepository flagMetricRepository;

    public ClientFlagService(FlagRepository flagRepository, FlagStrategyRepository flagStrategyRepository,
                             SegmentContextRepository segmentContextRepository,
                             ContextDefinitionRepository contextDefinitionRepository,
                             FlagMetricRepository flagMetricRepository) {
        this.flagRepository = flagRepository;
        this.flagStrategyRepository = flagStrategyRepository;
        this.segmentContextRepository = segmentContextRepository;
        this.contextDefinitionRepository = contextDefinitionRepository;
        this.flagMetricRepository = flagMetricRepository;
    }

    public List<ClientFlagResponse> getFlagsForProject(Integer projectId, Integer environmentId) {
        List<FlagWithStrategy> flags = flagRepository.findByProjectIdWithStrategyForEnvironment(projectId, environmentId);

        List<Integer> strategyIds = new ArrayList<>();
        List<Integer> segmentIds = new ArrayList<>();
        Set<Integer> contextDefIds = new LinkedHashSet<>();
        for (FlagWithStrategy fws : flags) {
            FlagStrategy s = fws.strategy();
            if (s != null) {
                strategyIds.add(s.getId());
                if (s.getSegmentIds() != null) {
                    segmentIds.addAll(s.getSegmentIds());
                }
                if (s.getContextValuesJson() != null) {
                    List<FlagConstraintParser.StrategyConstraint> parsed = parseStrategyConstraints(s.getContextValuesJson());
                    for (FlagConstraintParser.StrategyConstraint sc : parsed) {
                        contextDefIds.add(sc.cd());
                    }
                }
            }
        }

        flagStrategyRepository.touchLastUsedAt(strategyIds);

        Map<Integer, List<SegmentContextWithName>> segmentContextsMap;
        if (!segmentIds.isEmpty()) {
            List<SegmentContextWithName> allContexts = segmentContextRepository.findContextsBySegmentIds(segmentIds);
            segmentContextsMap = new LinkedHashMap<>();
            for (SegmentContextWithName ctx : allContexts) {
                segmentContextsMap.computeIfAbsent(ctx.getSegmentId(), k -> new ArrayList<>()).add(ctx);
            }
        } else {
            segmentContextsMap = Collections.emptyMap();
        }

        Map<Integer, ContextDefinition> contextDefMap = contextDefinitionRepository.findByIds(contextDefIds);

        return flags.stream().map(fws -> {
            Flag flag = fws.flag();
            FlagStrategy s = fws.strategy();
            Map<String, ConstraintMerge> merged = new LinkedHashMap<>();

            if (s != null) {
                if (s.getSegmentIds() != null) {
                    for (Integer segId : s.getSegmentIds()) {
                        List<SegmentContextWithName> segContexts = segmentContextsMap.getOrDefault(segId, Collections.emptyList());
                        for (SegmentContextWithName sc : segContexts) {
                            String key = sc.getContextDefinitionName() + "|" + sc.getOperator();
                            String ctxType = sc.getContextType() != null ? sc.getContextType() : "string";
                            merged.computeIfAbsent(key, k -> new ConstraintMerge(sc.getContextDefinitionName(), sc.getOperator(), ctxType))
                                    .values.addAll(FeatureFlagEvaluator.splitValues(sc.getContextValues()));
                        }
                    }
                }

                if (s.getContextValuesJson() != null) {
                    List<FlagConstraintParser.StrategyConstraint> parsed = parseStrategyConstraints(s.getContextValuesJson());
                    for (FlagConstraintParser.StrategyConstraint sc : parsed) {
                        ContextDefinition cd = contextDefMap.getOrDefault(sc.cd(), null);
                        String fieldName = cd != null ? cd.getContextKey() : String.valueOf(sc.cd());
                        String ctxType = cd != null && cd.getContextType() != null ? cd.getContextType() : "string";
                        String key = fieldName + "|" + sc.op();
                        merged.computeIfAbsent(key, k -> new ConstraintMerge(fieldName, sc.op(), ctxType))
                                .values.add(sc.val());
                    }
                }
            }

            List<ClientFlagResponse.Constraint> constraints;
            if (merged.isEmpty()) {
                constraints = null;
            } else {
                constraints = new ArrayList<>(merged.size());
                for (ConstraintMerge m : merged.values()) {
                    constraints.add(new ClientFlagResponse.Constraint(m.fieldName, m.operator, new ArrayList<>(m.values), m.contextType));
                }
            }

            return new ClientFlagResponse(flag, s, constraints);
        }).toList();
    }

    public List<ClientEvaluateResponse.ToggleResult> evaluate(Integer projectId, Integer environmentId, Map<String, String> context, Long clientInstanceId) {
        List<FlagWithStrategy> flags = flagRepository.findByProjectIdWithStrategyForEnvironment(projectId, environmentId);

        List<Integer> strategyIds = new ArrayList<>();
        List<Integer> segmentIds = new ArrayList<>();
        Set<Integer> contextDefIds = new LinkedHashSet<>();
        for (FlagWithStrategy fws : flags) {
            FlagStrategy s = fws.strategy();
            if (s != null) {
                strategyIds.add(s.getId());
                if (s.getSegmentIds() != null) {
                    segmentIds.addAll(s.getSegmentIds());
                }
                if (s.getContextValuesJson() != null) {
                    List<FlagConstraintParser.StrategyConstraint> parsed = parseStrategyConstraints(s.getContextValuesJson());
                    for (FlagConstraintParser.StrategyConstraint sc : parsed) {
                        contextDefIds.add(sc.cd());
                    }
                }
            }
        }

        flagStrategyRepository.touchLastUsedAt(strategyIds);

        Map<Integer, List<SegmentContextWithName>> segmentContextsMap;
        if (!segmentIds.isEmpty()) {
            List<SegmentContextWithName> allContexts = segmentContextRepository.findContextsBySegmentIds(segmentIds);
            segmentContextsMap = new LinkedHashMap<>();
            for (SegmentContextWithName ctx : allContexts) {
                segmentContextsMap.computeIfAbsent(ctx.getSegmentId(), k -> new ArrayList<>()).add(ctx);
            }
        } else {
            segmentContextsMap = Collections.emptyMap();
        }

        Map<Integer, ContextDefinition> contextDefMap = contextDefinitionRepository.findByIds(contextDefIds);

        FeatureFlagEvaluator evaluator = new FeatureFlagEvaluator();

        List<ClientEvaluateResponse.ToggleResult> results = new ArrayList<>();
        for (FlagWithStrategy fws : flags) {
            boolean enabled = evaluator.evaluateFlag(fws.flag(), fws.strategy(), context, segmentContextsMap, contextDefMap);
            flagMetricRepository.recordEvaluation(projectId, fws.flag().getId(), environmentId, enabled, clientInstanceId);

            if (enabled) {
                results.add(new ClientEvaluateResponse.ToggleResult(
                    fws.flag().getName(),
                    true,
                    new ClientEvaluateResponse.VariantData("enabled", true, null)
                ));
            }
        }
        return results;
    }

    public void recordMetrics(Integer projectId, Integer environmentId, ClientMetricsRequest request, Long clientInstanceId) {
        if (request.getEvaluations() == null) return;
        for (Map.Entry<String, ClientMetricsRequest.EvalCount> entry : request.getEvaluations().entrySet()) {
            Flag flag = flagRepository.findByProjectIdAndKey(projectId, entry.getKey());
            if (flag != null) {
                ClientMetricsRequest.EvalCount ec = entry.getValue();
                int t = (int) Math.min(ec.getTrueCount(), Integer.MAX_VALUE);
                int f = (int) Math.min(ec.getFalseCount(), Integer.MAX_VALUE);
                flagMetricRepository.recordEvaluations(projectId, flag.getId(), environmentId, t, f, clientInstanceId);
            }
        }
    }

    private static class ConstraintMerge {
        final String fieldName;
        final String operator;
        final String contextType;
        final LinkedHashSet<String> values = new LinkedHashSet<>();
        ConstraintMerge(String fieldName, String operator, String contextType) {
            this.fieldName = fieldName;
            this.operator = operator;
            this.contextType = contextType;
        }
    }
}
