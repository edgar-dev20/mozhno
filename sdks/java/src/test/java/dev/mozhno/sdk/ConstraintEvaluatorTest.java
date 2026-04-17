package dev.mozhno.sdk;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import dev.mozhno.sdk.model.FeatureFlag;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ConstraintEvaluatorTest {
    private ConstraintEvaluator evaluator;

    @BeforeEach
    void setUp() {
        evaluator = new ConstraintEvaluator();
    }

    @Test
    void simpleFlagEnabledNoActivation() {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test");
        flag.setName("test");
        flag.setEnabled(true);

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().build()));
    }

    @Test
    void simpleFlagDisabled() {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test");
        flag.setName("test");
        flag.setEnabled(false);

        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().build()));
    }

    @Test
    void constraintInMatches() {
        FeatureFlag flag = createFlagWithConstraint("country", "in", List.of("RU", "KZ"), null, null);

        MozhnoContext ctx = MozhnoContext.builder().addProperty("country", "RU").build();
        assertTrue(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintInDoesNotMatch() {
        FeatureFlag flag = createFlagWithConstraint("country", "in", List.of("RU", "KZ"), null, null);

        MozhnoContext ctx = MozhnoContext.builder().addProperty("country", "US").build();
        assertFalse(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintNotInMatches() {
        FeatureFlag flag = createFlagWithConstraint("country", "not_in", List.of("RU", "KZ"), null, null);

        MozhnoContext ctx = MozhnoContext.builder().addProperty("country", "US").build();
        assertTrue(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintNotInDoesNotMatch() {
        FeatureFlag flag = createFlagWithConstraint("country", "not_in", List.of("RU", "KZ"), null, null);

        MozhnoContext ctx = MozhnoContext.builder().addProperty("country", "RU").build();
        assertFalse(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintMissingField() {
        FeatureFlag flag = createFlagWithConstraint("country", "in", List.of("RU"), null, null);

        MozhnoContext ctx = MozhnoContext.builder().build();
        assertFalse(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintEqMatchesString() {
        FeatureFlag flag = createFlagWithConstraint("plan", "eq", List.of("premium"), null, "string");

        MozhnoContext ctx = MozhnoContext.builder().addProperty("plan", "premium").build();
        assertTrue(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintEqDoesNotMatchString() {
        FeatureFlag flag = createFlagWithConstraint("plan", "eq", List.of("premium"), null, "string");

        MozhnoContext ctx = MozhnoContext.builder().addProperty("plan", "basic").build();
        assertFalse(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintNeMatches() {
        FeatureFlag flag = createFlagWithConstraint("plan", "ne", List.of("premium"), null, "string");

        MozhnoContext ctx = MozhnoContext.builder().addProperty("plan", "basic").build();
        assertTrue(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintNeDoesNotMatch() {
        FeatureFlag flag = createFlagWithConstraint("plan", "ne", List.of("premium"), null, "string");

        MozhnoContext ctx = MozhnoContext.builder().addProperty("plan", "premium").build();
        assertFalse(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintEqNumberMatches() {
        FeatureFlag flag = createFlagWithConstraint("age", "eq", List.of("25"), null, "number");

        MozhnoContext ctx = MozhnoContext.builder().addProperty("age", "25").build();
        assertTrue(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintEqNumberDoesNotMatch() {
        FeatureFlag flag = createFlagWithConstraint("age", "eq", List.of("25"), null, "number");

        MozhnoContext ctx = MozhnoContext.builder().addProperty("age", "30").build();
        assertFalse(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void constraintGtNumber() {
        FeatureFlag flag = createFlagWithConstraint("age", "gt", List.of("18"), null, "number");

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("age", "25").build()));
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("age", "18").build()));
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("age", "10").build()));
    }

    @Test
    void constraintGteNumber() {
        FeatureFlag flag = createFlagWithConstraint("age", "gte", List.of("18"), null, "number");

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("age", "25").build()));
        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("age", "18").build()));
    }

    @Test
    void constraintLtNumber() {
        FeatureFlag flag = createFlagWithConstraint("age", "lt", List.of("65"), null, "number");

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("age", "30").build()));
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("age", "65").build()));
    }

    @Test
    void constraintLteNumber() {
        FeatureFlag flag = createFlagWithConstraint("age", "lte", List.of("65"), null, "number");

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("age", "30").build()));
        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("age", "65").build()));
    }

    @Test
    void constraintContains() {
        FeatureFlag flag = createFlagWithConstraint("email", "contains", List.of("@company.com"), null, "string");

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("email", "user@company.com").build()));
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("email", "user@gmail.com").build()));
    }

    @Test
    void constraintGtSemver() {
        FeatureFlag flag = createFlagWithConstraint("version", "gt", List.of("1.0.0"), null, "semver");

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("version", "2.0.0").build()));
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("version", "0.9.0").build()));
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("version", "1.0.0").build()));
    }

    @Test
    void constraintGteSemver() {
        FeatureFlag flag = createFlagWithConstraint("version", "gte", List.of("1.0.0"), null, "semver");

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("version", "1.0.0").build()));
        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("version", "1.0.1").build()));
    }

    @Test
    void constraintGtTime() {
        FeatureFlag flag = createFlagWithConstraint("createdAt", "gt", List.of("2024-01-01T00:00:00Z"), null, "time");

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("createdAt", "2025-01-01T00:00:00Z").build()));
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("createdAt", "2023-01-01T00:00:00Z").build()));
    }

    @Test
    void multipleConstraintsAllMustMatch() {
        FeatureFlag flag = createMultipleConstraints(
            List.of(
                new ConstraintData("country", "in", List.of("RU", "KZ"), null),
                new ConstraintData("age", "gte", List.of("18"), "number")
            ),
            null
        );

        assertTrue(evaluator.isEnabled(flag,
            MozhnoContext.builder().addProperty("country", "RU").addProperty("age", "25").build()));
        assertFalse(evaluator.isEnabled(flag,
            MozhnoContext.builder().addProperty("country", "RU").addProperty("age", "10").build()));
    }

    @Test
    void percentageRollout100() {
        FeatureFlag flag = createFlagWithConstraint(null, null, null, 100.0, null);

        MozhnoContext ctx = MozhnoContext.builder().userId("any").build();
        assertTrue(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void percentageRollout0() {
        FeatureFlag flag = createFlagWithConstraint(null, null, null, 0.0, null);

        MozhnoContext ctx = MozhnoContext.builder().userId("any").build();
        assertFalse(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void percentageRolloutDeterministic() {
        FeatureFlag flag = createFlagWithConstraint(null, null, null, 50.0, null);

        MozhnoContext ctx = MozhnoContext.builder().userId("test-user").build();
        boolean first = evaluator.isEnabled(flag, ctx);
        boolean second = evaluator.isEnabled(flag, ctx);
        assertEquals(first, second, "Same user should get same result");
    }

    @Test
    void noActivation() {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test");
        flag.setName("test");
        flag.setEnabled(true);

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().build()));
    }

    private static class ConstraintData {
        final String field;
        final String operator;
        final List<String> values;
        final String contextType;

        ConstraintData(String field, String operator, List<String> values, String contextType) {
            this.field = field;
            this.operator = operator;
            this.values = values;
            this.contextType = contextType;
        }
    }

    private FeatureFlag createFlagWithConstraint(String field, String operator, List<String> values, Double rollOut, String contextType) {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test-flag");
        flag.setName("test-flag");
        flag.setEnabled(true);

        FeatureFlag.Activation activation = new FeatureFlag.Activation();
        activation.setRollOut(rollOut);

        if (field != null) {
            FeatureFlag.Constraint constraint = new FeatureFlag.Constraint();
            constraint.setField(field);
            constraint.setOperator(operator);
            constraint.setValues(values);
            constraint.setContextType(contextType);
            activation.setConstraints(List.of(constraint));
        }

        flag.setActivation(activation);
        return flag;
    }

    private FeatureFlag createMultipleConstraints(List<ConstraintData> data, Double rollOut) {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test-flag");
        flag.setName("test-flag");
        flag.setEnabled(true);

        FeatureFlag.Activation activation = new FeatureFlag.Activation();
        activation.setRollOut(rollOut);

        List<FeatureFlag.Constraint> constraints = data.stream().map(d -> {
            FeatureFlag.Constraint c = new FeatureFlag.Constraint();
            c.setField(d.field);
            c.setOperator(d.operator);
            c.setValues(d.values);
            c.setContextType(d.contextType);
            return c;
        }).toList();
        activation.setConstraints(constraints);

        flag.setActivation(activation);
        return flag;
    }
}
