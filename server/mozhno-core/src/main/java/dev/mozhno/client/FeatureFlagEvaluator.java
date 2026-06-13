package dev.mozhno.client;

import dev.mozhno.contexts.ContextDefinition;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.strategy.FlagStrategy;
import dev.mozhno.segments.SegmentContextRepository.SegmentContextWithName;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static dev.mozhno.client.HashUtils.compareSemver;
import static dev.mozhno.client.HashUtils.murmurHash32;

public class FeatureFlagEvaluator {

    public boolean evaluateFlag(Flag flag, FlagStrategy s, Map<String, String> context,
                                 Map<Integer, List<SegmentContextWithName>> segmentContextsMap,
                                 Map<Integer, ContextDefinition> contextDefMap) {
        boolean enabled = s != null ? s.isEnabled() : flag.isEnabled();
        if (!enabled) return false;

        Map<String, ConstraintEval> evalConstraints = new LinkedHashMap<>();

        if (s != null) {
            if (s.getSegmentIds() != null) {
                for (Integer segId : s.getSegmentIds()) {
                    List<SegmentContextWithName> segContexts = segmentContextsMap.getOrDefault(segId, Collections.emptyList());
                    for (SegmentContextWithName sc : segContexts) {
                        String op = sc.getOperator() != null ? sc.getOperator() : "in";
                        String ctxType = sc.getContextType() != null ? sc.getContextType() : "string";
                        String key = sc.getContextDefinitionName() + "|" + op;
                        evalConstraints.computeIfAbsent(key, k -> new ConstraintEval(sc.getContextDefinitionName(), op, ctxType))
                                .values.addAll(splitValues(sc.getContextValues()));
                    }
                }
            }

            if (s.getContextValuesJson() != null) {
                List<FlagConstraintParser.StrategyConstraint> parsed =
                    FlagConstraintParser.parseStrategyConstraints(s.getContextValuesJson());
                for (FlagConstraintParser.StrategyConstraint sc : parsed) {
                    ContextDefinition cd = contextDefMap.getOrDefault(sc.cd(), null);
                    String fieldName = cd != null ? cd.getName() : String.valueOf(sc.cd());
                    String ctxType = cd != null && cd.getContextType() != null ? cd.getContextType() : "string";
                    String op = sc.op() != null ? sc.op() : "in";
                    String key = fieldName + "|" + op;
                    evalConstraints.computeIfAbsent(key, k -> new ConstraintEval(fieldName, op, ctxType))
                            .values.add(sc.val());
                }
            }
        }

        for (ConstraintEval ce : evalConstraints.values()) {
            String contextValue = context.get(ce.fieldName);
            if (contextValue == null) return false;

            if ("in".equals(ce.operator)) {
                if (!ce.values.contains(contextValue)) return false;
            } else if ("not_in".equals(ce.operator)) {
                if (ce.values.contains(contextValue)) return false;
            } else {
                boolean anyMatch = false;
                for (String checkValue : ce.values) {
                    if (evaluateConstraintOp(ce.operator, ce.contextType, contextValue, checkValue)) {
                        anyMatch = true;
                        break;
                    }
                }
                if (!anyMatch) return false;
            }
        }

        if (s != null && s.getPercentage() != null) {
            if (s.getPercentage() >= 100) return true;
            if (s.getPercentage() <= 0) return false;
            String seed = flag.getKey() + context.getOrDefault("userId", context.getOrDefault("sessionId", ""));
            int hash = murmurHash32(seed.getBytes(StandardCharsets.UTF_8));
            int bucket = Math.abs(hash) % 100;
            return bucket < s.getPercentage().intValue();
        }

        return true;
    }

    static class ConstraintEval {
        final String fieldName;
        final String operator;
        final String contextType;
        final List<String> values = new ArrayList<>();
        ConstraintEval(String fieldName, String operator, String contextType) {
            this.fieldName = fieldName;
            this.operator = operator;
            this.contextType = contextType;
        }
    }

    static boolean evaluateConstraintOp(String operator, String contextType, String contextValue, String checkValue) {
        switch (operator) {
            case "in":
                return checkValue.equals(contextValue);
            case "not_in":
                return !checkValue.equals(contextValue);
            case "eq":
                if ("number".equals(contextType)) {
                    try {
                        return Double.parseDouble(contextValue) == Double.parseDouble(checkValue);
                    } catch (NumberFormatException e) { return false; }
                }
                return contextValue.equals(checkValue);
            case "ne":
                if ("number".equals(contextType)) {
                    try {
                        return Double.parseDouble(contextValue) != Double.parseDouble(checkValue);
                    } catch (NumberFormatException e) { return false; }
                }
                return !contextValue.equals(checkValue);
            case "gt":
                return compareValues(contextType, contextValue, checkValue) > 0;
            case "gte":
                return compareValues(contextType, contextValue, checkValue) >= 0;
            case "lt":
                return compareValues(contextType, contextValue, checkValue) < 0;
            case "lte":
                return compareValues(contextType, contextValue, checkValue) <= 0;
            case "contains":
                return contextValue.contains(checkValue);
            default:
                return false;
        }
    }

    private static int compareValues(String contextType, String a, String b) {
        if ("number".equals(contextType)) {
            try {
                double da = Double.parseDouble(a);
                double db = Double.parseDouble(b);
                return Double.compare(da, db);
            } catch (NumberFormatException e) { return a.compareTo(b); }
        }
        if ("time".equals(contextType)) {
            try {
                long ta = Instant.parse(a).toEpochMilli();
                long tb = Instant.parse(b).toEpochMilli();
                return Long.compare(ta, tb);
            } catch (Exception e) { return a.compareTo(b); }
        }
        if ("semver".equals(contextType)) {
            return compareSemver(a, b);
        }
        return a.compareTo(b);
    }

    static List<String> splitValues(String contextValues) {
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
