package dev.mozhno.client;

import dev.mozhno.contexts.ContextDefinition;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.strategy.FlagStrategy;
import dev.mozhno.segments.SegmentContextRepository.SegmentContextWithName;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static dev.mozhno.client.HashUtils.compareSemver;
import static dev.mozhno.client.HashUtils.murmurHash32;

public class FeatureFlagEvaluator {

    public static final String OP_IN = "in";
    public static final String OP_NOT_IN = "not_in";
    public static final String OP_EQ = "eq";
    public static final String OP_NE = "ne";
    public static final String OP_GT = "gt";
    public static final String OP_GTE = "gte";
    public static final String OP_LT = "lt";
    public static final String OP_LTE = "lte";
    public static final String OP_CONTAINS = "contains";
    public static final String DEFAULT_OP = OP_IN;

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
                        String op = sc.getOperator() != null ? sc.getOperator() : DEFAULT_OP;
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
                    String fieldName = cd != null ? cd.getContextKey() : String.valueOf(sc.cd());
                    String ctxType = cd != null && cd.getContextType() != null ? cd.getContextType() : "string";
                    String op = sc.op() != null ? sc.op() : DEFAULT_OP;
                    String key = fieldName + "|" + op;
                    evalConstraints.computeIfAbsent(key, k -> new ConstraintEval(fieldName, op, ctxType))
                            .values.add(sc.val());
                }
            }
        }

        for (ConstraintEval ce : evalConstraints.values()) {
            String contextValue = context.get(ce.fieldName);
            if (contextValue == null) return false;

            if (OP_IN.equals(ce.operator)) {
                if (!ce.values.contains(contextValue)) return false;
            } else if (OP_NOT_IN.equals(ce.operator)) {
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
            int bucket = Math.abs(hash % 100);
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
            case OP_IN:
                return checkValue.equals(contextValue);
            case OP_NOT_IN:
                return !checkValue.equals(contextValue);
            case OP_EQ:
                if ("number".equals(contextType)) {
                    try {
                        return Double.parseDouble(contextValue) == Double.parseDouble(checkValue);
                    } catch (NumberFormatException e) { return false; }
                }
                return contextValue.equals(checkValue);
            case OP_NE:
                if ("number".equals(contextType)) {
                    try {
                        return Double.parseDouble(contextValue) != Double.parseDouble(checkValue);
                    } catch (NumberFormatException e) { return false; }
                }
                return !contextValue.equals(checkValue);
            case OP_GT:
                return compareValues(contextType, contextValue, checkValue) > 0;
            case OP_GTE:
                return compareValues(contextType, contextValue, checkValue) >= 0;
            case OP_LT:
                return compareValues(contextType, contextValue, checkValue) < 0;
            case OP_LTE:
                return compareValues(contextType, contextValue, checkValue) <= 0;
            case OP_CONTAINS:
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
            } catch (DateTimeParseException e) { return 0; }
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
