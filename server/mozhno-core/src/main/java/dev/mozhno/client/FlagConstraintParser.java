package dev.mozhno.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public final class FlagConstraintParser {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger log = LoggerFactory.getLogger(FlagConstraintParser.class);

    private FlagConstraintParser() {}

    public record StrategyConstraint(int cd, String op, String val) {
        public StrategyConstraint {
            op = op != null ? op : "in";
            val = val != null ? val : "";
        }
    }

    public static List<StrategyConstraint> parseStrategyConstraints(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            List<Map<String, Object>> list = objectMapper.readValue(json,
                    new TypeReference<>() {});
            List<StrategyConstraint> result = new ArrayList<>(list.size());
            for (Map<String, Object> item : list) {
                int cd = toInt(item.get("cd"));
                String op = toString(item.get("op"));
                String val = toString(item.get("val"));
                result.add(new StrategyConstraint(cd, op, val));
            }
            return result;
        } catch (Exception e) {
            log.warn("Failed to parse strategy constraints JSON: {}", json, e);
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
}
