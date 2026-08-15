package dev.mozhno.client;

import dev.mozhno.ContextType;
import dev.mozhno.contexts.ContextDefinition;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagType;
import dev.mozhno.flags.strategy.FlagStrategy;
import dev.mozhno.segments.SegmentContextRepository.SegmentContextWithName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static dev.mozhno.client.HashUtils.murmurHash32;
import static org.assertj.core.api.Assertions.assertThat;

class FeatureFlagEvaluatorTest {

    private final FeatureFlagEvaluator evaluator = new FeatureFlagEvaluator();

    private Flag flag() {
        Flag flag = new Flag();
        flag.setName("Test Flag");
        flag.setKey("test-flag");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        return flag;
    }

    private ContextDefinition contextDef(Integer id, String key, String type) {
        ContextDefinition cd = new ContextDefinition();
        cd.setId(id);
        cd.setContextKey(key);
        cd.setContextType(type);
        return cd;
    }

    private SegmentContextWithName segmentContext(String field, String type, String op, String values) {
        return new SegmentContextWithName(1, 1, field, type, op, values);
    }

    private boolean evaluate(Flag flag, FlagStrategy strategy, Map<String, String> context,
                             Map<Integer, List<SegmentContextWithName>> segmentContextsMap,
                             Map<Integer, ContextDefinition> contextDefMap) {
        return evaluator.evaluateFlag(flag, strategy, context, segmentContextsMap, contextDefMap);
    }

    @Test
    void disabledFlagWithoutStrategy_shouldReturnFalse() {
        Flag flag = flag();
        flag.setEnabled(false);

        assertThat(evaluate(flag, null, Map.of(), Collections.emptyMap(), Collections.emptyMap())).isFalse();
    }

    @Test
    void disabledFlagWithEnabledStrategy_shouldUseStrategyState() {
        Flag flag = flag();
        flag.setEnabled(false);
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);

        assertThat(evaluate(flag, s, Map.of(), Collections.emptyMap(), Collections.emptyMap())).isTrue();
    }

    @Test
    void disabledStrategy_shouldReturnFalse() {
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(false);

        assertThat(evaluate(flag(), s, Map.of(), Collections.emptyMap(), Collections.emptyMap())).isFalse();
    }

    @Test
    void noStrategy_shouldUseFlagEnabled() {
        assertThat(evaluate(flag(), null, Map.of(), Collections.emptyMap(), Collections.emptyMap())).isTrue();
    }

    @Test
    void directOnly_allMatch_shouldReturnTrue() {
        ContextDefinition cd = contextDef(10, "plan", ContextType.STRING.getValue());
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setContextValuesJson("[{\"cd\":10,\"op\":\"in\",\"val\":\"premium\"}]");

        assertThat(evaluate(flag(), s, Map.of("plan", "premium"), Collections.emptyMap(), Map.of(10, cd))).isTrue();
    }

    @Test
    void directOnly_missingContextField_shouldReturnFalse() {
        ContextDefinition cd = contextDef(10, "plan", ContextType.STRING.getValue());
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setContextValuesJson("[{\"cd\":10,\"op\":\"in\",\"val\":\"premium\"}]");

        assertThat(evaluate(flag(), s, Map.of(), Collections.emptyMap(), Map.of(10, cd))).isFalse();
    }

    @Test
    void segmentOnly_match_shouldReturnTrue() {
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setSegmentIds(List.of(1));
        Map<Integer, List<SegmentContextWithName>> segMap = Map.of(
            1, List.of(segmentContext("userId", ContextType.STRING.getValue(), "in", "user-100")));

        assertThat(evaluate(flag(), s, Map.of("userId", "user-100"), segMap, Collections.emptyMap())).isTrue();
    }

    @Test
    void segmentOnly_noMatch_shouldReturnFalse() {
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setSegmentIds(List.of(1));
        Map<Integer, List<SegmentContextWithName>> segMap = Map.of(
            1, List.of(segmentContext("userId", ContextType.STRING.getValue(), "in", "user-100")));

        assertThat(evaluate(flag(), s, Map.of("userId", "other"), segMap, Collections.emptyMap())).isFalse();
    }

    @Test
    void segmentOnly_emptySegment_shouldNotMatchAnyUser() {
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setSegmentIds(List.of(1));
        Map<Integer, List<SegmentContextWithName>> segMap = Map.of(1, Collections.emptyList());

        assertThat(evaluate(flag(), s, Map.of(), segMap, Collections.emptyMap())).isFalse();
    }

    @Test
    void segmentOnly_missingSegmentFromMap_shouldNotMatchAnyUser() {
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setSegmentIds(List.of(999));

        assertThat(evaluate(flag(), s, Map.of(), Collections.emptyMap(), Collections.emptyMap())).isFalse();
    }

    @Test
    void directAndSegment_emptySegment_directMatches_shouldReturnTrue() {
        ContextDefinition cd = contextDef(10, "plan", ContextType.STRING.getValue());
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setSegmentIds(List.of(1));
        s.setContextValuesJson("[{\"cd\":10,\"op\":\"in\",\"val\":\"premium\"}]");
        Map<Integer, List<SegmentContextWithName>> segMap = Map.of(1, Collections.emptyList());

        assertThat(evaluate(flag(), s, Map.of("plan", "premium"), segMap, Map.of(10, cd))).isTrue();
    }

    @Test
    void directAndSegment_emptySegment_directMismatch_shouldReturnFalse() {
        ContextDefinition cd = contextDef(10, "plan", ContextType.STRING.getValue());
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setSegmentIds(List.of(1));
        s.setContextValuesJson("[{\"cd\":10,\"op\":\"in\",\"val\":\"premium\"}]");
        Map<Integer, List<SegmentContextWithName>> segMap = Map.of(1, Collections.emptyList());

        assertThat(evaluate(flag(), s, Map.of("plan", "free"), segMap, Map.of(10, cd))).isFalse();
    }

    @Test
    void directAndSegment_directMatchesSegmentDoesNot_shouldReturnTrue() {
        ContextDefinition cd = contextDef(10, "plan", ContextType.STRING.getValue());
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setSegmentIds(List.of(1));
        s.setContextValuesJson("[{\"cd\":10,\"op\":\"in\",\"val\":\"premium\"}]");
        Map<Integer, List<SegmentContextWithName>> segMap = Map.of(
            1, List.of(segmentContext("userId", ContextType.STRING.getValue(), "in", "user-100")));

        assertThat(evaluate(flag(), s, Map.of("plan", "premium"), segMap, Map.of(10, cd))).isTrue();
    }

    @Test
    void directAndSegment_segmentMatchesDirectDoesNot_shouldReturnTrue() {
        ContextDefinition cd = contextDef(10, "plan", ContextType.STRING.getValue());
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setSegmentIds(List.of(1));
        s.setContextValuesJson("[{\"cd\":10,\"op\":\"in\",\"val\":\"premium\"}]");
        Map<Integer, List<SegmentContextWithName>> segMap = Map.of(
            1, List.of(segmentContext("userId", ContextType.STRING.getValue(), "in", "user-100")));

        assertThat(evaluate(flag(), s, Map.of("userId", "user-100"), segMap, Map.of(10, cd))).isTrue();
    }

    @Test
    void directAndSegment_neitherMatches_shouldReturnFalse() {
        ContextDefinition cd = contextDef(10, "plan", ContextType.STRING.getValue());
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setSegmentIds(List.of(1));
        s.setContextValuesJson("[{\"cd\":10,\"op\":\"in\",\"val\":\"premium\"}]");
        Map<Integer, List<SegmentContextWithName>> segMap = Map.of(
            1, List.of(segmentContext("userId", ContextType.STRING.getValue(), "in", "user-100")));

        assertThat(evaluate(flag(), s, Map.of("userId", "other"), segMap, Map.of(10, cd))).isFalse();
    }

    @Test
    void percentage_100_shouldReturnTrueAfterTargeting() {
        ContextDefinition cd = contextDef(10, "plan", ContextType.STRING.getValue());
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setPercentage(100.0);
        s.setContextValuesJson("[{\"cd\":10,\"op\":\"in\",\"val\":\"premium\"}]");

        assertThat(evaluate(flag(), s, Map.of("plan", "premium"), Collections.emptyMap(), Map.of(10, cd))).isTrue();
    }

    @Test
    void percentage_0_shouldReturnFalseAfterTargeting() {
        ContextDefinition cd = contextDef(10, "plan", ContextType.STRING.getValue());
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setPercentage(0.0);
        s.setContextValuesJson("[{\"cd\":10,\"op\":\"in\",\"val\":\"premium\"}]");

        assertThat(evaluate(flag(), s, Map.of("plan", "premium"), Collections.emptyMap(), Map.of(10, cd))).isFalse();
    }

    @Test
    void percentage_bucket_shouldMatchHashDistribution() {
        FlagStrategy s = new FlagStrategy();
        s.setEnabled(true);
        s.setPercentage(74.0);

        Flag flag = flag();
        int hash = Math.abs(murmurHash32((flag.getKey() + "user-1").getBytes(StandardCharsets.UTF_8)) % 100);
        boolean expected = hash < 74;

        assertThat(evaluate(flag, s, Map.of("userId", "user-1"), Collections.emptyMap(), Collections.emptyMap()))
            .isEqualTo(expected);
    }
}
