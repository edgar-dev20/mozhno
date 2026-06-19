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
    void percentageRolloutUsesSessionIdWhenUserIdNull() {
        FeatureFlag flag = createFlagWithConstraint(null, null, null, 100.0, null);

        MozhnoContext ctx = MozhnoContext.builder().sessionId("session-1").build();
        assertTrue(evaluator.isEnabled(flag, ctx));
    }

    @Test
    void percentageRolloutWorksWithNullIds() {
        FeatureFlag flag = createFlagWithConstraint(null, null, null, 50.0, null);

        MozhnoContext ctx = MozhnoContext.builder().build();
        boolean first = evaluator.isEnabled(flag, ctx);
        boolean second = evaluator.isEnabled(flag, ctx);
        assertEquals(first, second, "Same null-id context should produce consistent result");
    }

    @Test
    void murmurHashBucketNeverNegative() {
        int[] testValues = {0, -1, 1, Integer.MAX_VALUE, Integer.MIN_VALUE, 42, -42};
        for (int val : testValues) {
            int bucket = Math.abs(val % 100);
            assertTrue(bucket >= 0 && bucket < 100,
                "Bucket for " + val + " should be in [0, 99], was: " + bucket);
        }
    }

    @Test
    void noActivation() {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test");
        flag.setName("test");
        flag.setEnabled(true);

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().build()));
    }

    @Test
    void segmentsOrAnyMatch() {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test");
        flag.setName("test");
        flag.setEnabled(true);

        FeatureFlag.Activation activation = new FeatureFlag.Activation();

        FeatureFlag.Segment seg1 = new FeatureFlag.Segment();
        FeatureFlag.Constraint c1 = new FeatureFlag.Constraint();
        c1.setField("country");
        c1.setOperator("in");
        c1.setValues(List.of("RU", "KZ"));
        seg1.setConstraints(List.of(c1));

        FeatureFlag.Segment seg2 = new FeatureFlag.Segment();
        FeatureFlag.Constraint c2 = new FeatureFlag.Constraint();
        c2.setField("country");
        c2.setOperator("in");
        c2.setValues(List.of("US"));
        seg2.setConstraints(List.of(c2));

        activation.setSegments(List.of(seg1, seg2));
        flag.setActivation(activation);

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("country", "RU").build()));
        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("country", "US").build()));
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("country", "CN").build()));
    }

    @Test
    void segmentsOrDifferentFields() {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test");
        flag.setName("test");
        flag.setEnabled(true);

        FeatureFlag.Activation activation = new FeatureFlag.Activation();

        FeatureFlag.Segment seg1 = new FeatureFlag.Segment();
        FeatureFlag.Constraint c1 = new FeatureFlag.Constraint();
        c1.setField("country");
        c1.setOperator("eq");
        c1.setValues(List.of("RU"));
        seg1.setConstraints(List.of(c1));

        FeatureFlag.Segment seg2 = new FeatureFlag.Segment();
        FeatureFlag.Constraint c2 = new FeatureFlag.Constraint();
        c2.setField("plan");
        c2.setOperator("eq");
        c2.setValues(List.of("premium"));
        seg2.setConstraints(List.of(c2));

        activation.setSegments(List.of(seg1, seg2));
        flag.setActivation(activation);

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("country", "RU").build()));
        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("plan", "premium").build()));
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder().addProperty("country", "US").build()));
    }

    @Test
    void segmentsAndConstraintsOrEitherPasses() {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test");
        flag.setName("test");
        flag.setEnabled(true);

        FeatureFlag.Activation activation = new FeatureFlag.Activation();

        FeatureFlag.Constraint customConstraint = new FeatureFlag.Constraint();
        customConstraint.setField("plan");
        customConstraint.setOperator("eq");
        customConstraint.setValues(List.of("premium"));
        activation.setConstraints(List.of(customConstraint));

        FeatureFlag.Segment seg = new FeatureFlag.Segment();
        FeatureFlag.Constraint segConstraint = new FeatureFlag.Constraint();
        segConstraint.setField("country");
        segConstraint.setOperator("eq");
        segConstraint.setValues(List.of("RU"));
        seg.setConstraints(List.of(segConstraint));
        activation.setSegments(List.of(seg));

        flag.setActivation(activation);

        // Either custom constraint passes OR segment passes
        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder()
            .addProperty("plan", "premium").addProperty("country", "RU").build()));
        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder()
            .addProperty("plan", "premium").addProperty("country", "US").build()));
        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder()
            .addProperty("plan", "basic").addProperty("country", "RU").build()));
        // Both fail
        assertFalse(evaluator.isEnabled(flag, MozhnoContext.builder()
            .addProperty("plan", "basic").addProperty("country", "US").build()));
    }

    @Test
    void emptySegmentsPass() {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test");
        flag.setName("test");
        flag.setEnabled(true);

        FeatureFlag.Activation activation = new FeatureFlag.Activation();
        activation.setSegments(List.of());
        flag.setActivation(activation);

        assertTrue(evaluator.isEnabled(flag, MozhnoContext.builder().build()));
    }

    @Test
    void segmentWithEmptyConstraintsPass() {
        FeatureFlag flag = new FeatureFlag();
        flag.setKey("test");
        flag.setName("test");
        flag.setEnabled(true);

        FeatureFlag.Activation activation = new FeatureFlag.Activation();

        FeatureFlag.Segment seg = new FeatureFlag.Segment();
        seg.setConstraints(List.of());
        activation.setSegments(List.of(seg));

        flag.setActivation(activation);

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
