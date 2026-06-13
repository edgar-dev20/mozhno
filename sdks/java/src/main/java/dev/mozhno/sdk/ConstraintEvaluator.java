package dev.mozhno.sdk;

import dev.mozhno.sdk.model.FeatureFlag;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public class ConstraintEvaluator {

    public boolean isEnabled(FeatureFlag flag, MozhnoContext context) {
        if (!flag.isEnabled()) return false;

        FeatureFlag.Activation activation = flag.getActivation();
        if (activation == null) return true;

        if (!evaluateConstraints(activation.getConstraints(), context)) return false;

        if (activation.getRollOut() != null) {
            if (activation.getRollOut() >= 100) return true;
            if (activation.getRollOut() <= 0) return false;
            String identifier = context.getProperty("userId");
            if (identifier == null) {
                identifier = context.getProperty("sessionId");
            }
            String seed = flag.getKey() + (identifier != null ? identifier : "");
            int hash = murmurHash32(seed.getBytes(StandardCharsets.UTF_8));
            int bucket = Math.abs(hash % 100);
            return bucket < activation.getRollOut().intValue();
        }

        return true;
    }

    public boolean evaluateConstraints(List<FeatureFlag.Constraint> constraints, MozhnoContext context) {
        if (constraints == null || constraints.isEmpty()) return true;

        for (FeatureFlag.Constraint constraint : constraints) {
            String fieldValue = context.getProperty(constraint.getField());
            if (fieldValue == null) return false;

            String operator = constraint.getOperator() != null ? constraint.getOperator() : "in";
            List<String> values = constraint.getValues();
            String contextType = constraint.getContextType();

            if (values == null || values.isEmpty()) continue;

            if ("in".equals(operator)) {
                if (!values.contains(fieldValue)) return false;
            } else if ("not_in".equals(operator)) {
                if (values.contains(fieldValue)) return false;
            } else {
                boolean anyMatch = false;
                for (String checkValue : values) {
                    if (evaluateConstraintOp(operator, contextType, fieldValue, checkValue)) {
                        anyMatch = true;
                        break;
                    }
                }
                if (!anyMatch) return false;
            }
        }
        return true;
    }

    private static boolean evaluateConstraintOp(String operator, String contextType,
                                                  String contextValue, String checkValue) {
        return switch (operator) {
            case "in" -> checkValue.equals(contextValue);
            case "not_in" -> !checkValue.equals(contextValue);
            case "eq" -> {
                if ("number".equals(contextType)) {
                    try {
                        yield Double.parseDouble(contextValue) == Double.parseDouble(checkValue);
                    } catch (NumberFormatException e) {
                        yield false;
                    }
                }
                yield contextValue.equals(checkValue);
            }
            case "ne" -> {
                if ("number".equals(contextType)) {
                    try {
                        yield Double.parseDouble(contextValue) != Double.parseDouble(checkValue);
                    } catch (NumberFormatException e) {
                        yield false;
                    }
                }
                yield !contextValue.equals(checkValue);
            }
            case "gt" -> compareValues(contextType, contextValue, checkValue) > 0;
            case "gte" -> compareValues(contextType, contextValue, checkValue) >= 0;
            case "lt" -> compareValues(contextType, contextValue, checkValue) < 0;
            case "lte" -> compareValues(contextType, contextValue, checkValue) <= 0;
            case "contains" -> contextValue.contains(checkValue);
            default -> false;
        };
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

    private static int compareSemver(String a, String b) {
        String[] pa = a.replaceAll("[^0-9.]", "").split("\\.");
        String[] pb = b.replaceAll("[^0-9.]", "").split("\\.");
        int maxLen = Math.max(pa.length, pb.length);
        for (int i = 0; i < maxLen; i++) {
            int va = i < pa.length ? parsePart(pa[i]) : 0;
            int vb = i < pb.length ? parsePart(pb[i]) : 0;
            if (va != vb) return Integer.compare(va, vb);
        }
        return 0;
    }

    private static int parsePart(String s) {
        try { return Integer.parseInt(s); } catch (NumberFormatException e) { return 0; }
    }

    static int murmurHash32(byte[] data) {
        int length = data.length;
        int h1 = 0;
        int c1 = 0xcc9e2d51;
        int c2 = 0x1b873593;

        for (int i = 0; i + 4 <= length; i += 4) {
            int k1 = (data[i] & 0xff) | ((data[i + 1] & 0xff) << 8)
                   | ((data[i + 2] & 0xff) << 16) | ((data[i + 3] & 0xff) << 24);
            k1 *= c1;
            k1 = Integer.rotateLeft(k1, 15);
            k1 *= c2;
            h1 ^= k1;
            h1 = Integer.rotateLeft(h1, 13);
            h1 = h1 * 5 + 0xe6546b64;
        }

        int k1 = 0;
        int tail = length & 3;
        if (tail >= 3) k1 ^= (data[length - 3] & 0xff) << 16;
        if (tail >= 2) k1 ^= (data[length - 2] & 0xff) << 8;
        if (tail >= 1) {
            k1 ^= (data[length - 1] & 0xff);
            k1 *= c1;
            k1 = Integer.rotateLeft(k1, 15);
            k1 *= c2;
            h1 ^= k1;
        }

        h1 ^= length;
        h1 ^= h1 >>> 16;
        h1 *= 0x85ebca6b;
        h1 ^= h1 >>> 13;
        h1 *= 0xc2b2ae35;
        h1 ^= h1 >>> 16;

        return h1;
    }
}
