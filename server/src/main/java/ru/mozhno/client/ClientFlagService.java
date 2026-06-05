package ru.mozhno.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;
import ru.mozhno.contexts.ContextDefinition;
import ru.mozhno.contexts.ContextDefinitionRepository;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagRepository;
import ru.mozhno.flags.strategy.FlagStrategy;
import ru.mozhno.flags.strategy.FlagStrategyRepository;
import ru.mozhno.metrics.FlagMetricRepository;
import ru.mozhno.segments.SegmentContextRepository;
import ru.mozhno.segments.SegmentContextRepository.SegmentContextWithName;
import ru.mozhno.client.ClientFlagResponse.Constraint;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class ClientFlagService {
    private final FlagRepository flagRepository;
    private final FlagStrategyRepository flagStrategyRepository;
    private final SegmentContextRepository segmentContextRepository;
    private final ContextDefinitionRepository contextDefinitionRepository;
    private final FlagMetricRepository flagMetricRepository;
    private static final ObjectMapper objectMapper = new ObjectMapper();

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
        List<Flag> flags = flagRepository.findByProjectIdWithStrategyForEnvironment(projectId, environmentId);

        List<Integer> strategyIds = new ArrayList<>();
        List<Integer> segmentIds = new ArrayList<>();
        for (Flag flag : flags) {
            FlagStrategy s = flag.getStrategy();
            if (s != null) {
                strategyIds.add(s.getId());
                if (s.getSegmentIds() != null) {
                    segmentIds.addAll(s.getSegmentIds());
                }
            }
        }

        flagStrategyRepository.touchLastUsedAt(strategyIds);

        for (Flag flag : flags) {
            FlagStrategy s = flag.getStrategy();
            boolean enabled = s != null ? s.isEnabled() : flag.isEnabled();
            flagMetricRepository.recordEvaluation(projectId, flag.getId(), environmentId, enabled);
        }

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

        return flags.stream().map(flag -> {
            Map<String, ConstraintMerge> merged = new LinkedHashMap<>();

            FlagStrategy s = flag.getStrategy();
            if (s != null) {
                if (s.getSegmentIds() != null) {
                    for (Integer segId : s.getSegmentIds()) {
                        List<SegmentContextWithName> segContexts = segmentContextsMap.getOrDefault(segId, Collections.emptyList());
                        for (SegmentContextWithName sc : segContexts) {
                            String key = sc.getContextDefinitionName() + "|" + sc.getOperator();
                            merged.computeIfAbsent(key, k -> new ConstraintMerge(sc.getContextDefinitionName(), sc.getOperator()))
                                    .values.addAll(splitValues(sc.getContextValues()));
                        }
                    }
                }

                if (s.getContextValuesJson() != null) {
                    List<StrategyConstraint> parsed = parseStrategyConstraints(s.getContextValuesJson());
                    for (StrategyConstraint sc : parsed) {
                        String fieldName = resolveContextName(sc.cd);
                        String key = fieldName + "|" + sc.op;
                        merged.computeIfAbsent(key, k -> new ConstraintMerge(fieldName, sc.op))
                                .values.add(sc.val);
                    }
                }
            }

            List<Constraint> constraints;
            if (merged.isEmpty()) {
                constraints = null;
            } else {
                constraints = new ArrayList<>(merged.size());
                for (ConstraintMerge m : merged.values()) {
                    constraints.add(new Constraint(m.fieldName, m.operator, new ArrayList<>(m.values)));
                }
            }

            return new ClientFlagResponse(flag, constraints);
        }).toList();
    }

    private static class StrategyConstraint {
        final int cd;
        final String op;
        final String val;
        StrategyConstraint(int cd, String op, String val) {
            this.cd = cd;
            this.op = op != null ? op : "in";
            this.val = val != null ? val : "";
        }
    }

    private static class ConstraintMerge {
        final String fieldName;
        final String operator;
        final LinkedHashSet<String> values = new LinkedHashSet<>();
        ConstraintMerge(String fieldName, String operator) {
            this.fieldName = fieldName;
            this.operator = operator;
        }
    }

    private String resolveContextName(int contextDefinitionId) {
        ContextDefinition cd = contextDefinitionRepository.findById(contextDefinitionId);
        return cd != null ? cd.getName() : String.valueOf(contextDefinitionId);
    }

    private static List<StrategyConstraint> parseStrategyConstraints(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            List<Map<String, Object>> list = objectMapper.readValue(json,
                    new TypeReference<List<Map<String, Object>>>() {});
            List<StrategyConstraint> result = new ArrayList<>(list.size());
            for (Map<String, Object> item : list) {
                int cd = toInt(item.get("cd"));
                String op = toString(item.get("op"));
                String val = toString(item.get("val"));
                result.add(new StrategyConstraint(cd, op, val));
            }
            return result;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private static int toInt(Object obj) {
        if (obj instanceof Number n) return n.intValue();
        if (obj instanceof String s) {
            try { return Integer.parseInt(s); } catch (NumberFormatException e) { return 0; }
        }
        return 0;
    }

    private static String toString(Object obj) {
        return obj != null ? obj.toString() : "";
    }

    private static List<String> splitValues(String contextValues) {
        if (contextValues == null || contextValues.isBlank()) {
            return Collections.emptyList();
        }
        String[] parts = contextValues.split(",");
        List<String> result = new ArrayList<>(parts.length);
        for (String part : parts) {
            String trimmed = part.trim();
            if (!trimmed.isEmpty()) {
                result.add(trimmed);
            }
        }
        return result;
    }
}