package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.client.ClientEvaluateResponse;
import dev.mozhno.client.ClientFlagResponse;
import dev.mozhno.client.ClientFlagService;
import dev.mozhno.client.ClientMetricsRequest;
import dev.mozhno.contexts.ContextDefinition;
import dev.mozhno.environments.Environment;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagType;
import dev.mozhno.flags.strategy.FlagStrategy;
import dev.mozhno.projects.Project;
import dev.mozhno.segments.Segment;
import dev.mozhno.segments.SegmentContext;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ClientFlagServiceTest extends BaseIntegrationTest {

    @Autowired
    private ClientFlagService clientFlagService;

    private Integer projectId;
    private Integer envId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("Service Test Project");
        projectId = projectRepository.save(p).getId();

        Environment env = new Environment();
        env.setName("production");
        env.setProjectId(projectId);
        envId = environmentRepository.save(env).getId();
    }

    @Test
    void getFlagsForProject_shouldReturnFlagsWithStrategies() {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("My Feature");
        flag.setKey("my-feature");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        ClientFlagResponse resp = result.get(0);
        assertThat(resp.getName()).isEqualTo("My Feature");
        assertThat(resp.getKey()).isEqualTo("my-feature");
        assertThat(resp.isEnabled()).isTrue();
        assertThat(resp.getActivation()).isNotNull();
    }

    @Test
    void getFlagsForProject_withPercentage_shouldReturnActivationWithRollOut() {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Gradual Feature");
        flag.setKey("gradual-feature");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setPercentage(50.0);
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getActivation()).isNotNull();
        assertThat(result.get(0).getActivation().getRollOut()).isEqualTo(50.0);
    }

    @Test
    void getFlagsForProject_emptyProject_shouldReturnEmptyList() {
        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);
        assertThat(result).isEmpty();
    }

    @Test
    void getFlagsForProject_wrongEnvironment_shouldReturnEmptyList() {
        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, 9999);
        assertThat(result).isEmpty();
    }

    @Test
    void strategyConstraintOnly_shouldReturnConstraint() {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("User ID");
        cd.setContextKey("userId");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Strategy Only");
        flag.setKey("strategy-only");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setContextDefinitionId(cdId);
        s.setContextValuesJson("[{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"user-1\"},{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"user-2\"}]");
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        List<ClientFlagResponse.Constraint> constraints = result.get(0).getActivation().getConstraints();
        assertThat(constraints).hasSize(1);
        assertThat(constraints.get(0).getField()).isEqualTo("userId");
        assertThat(constraints.get(0).getOperator()).isEqualTo("in");
        assertThat(constraints.get(0).getValues()).containsExactly("user-1", "user-2");
    }

    @Test
    void segmentConstraintOnly_shouldReturnSegments() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("VIP Users");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition cd = new ContextDefinition();
        cd.setName("User ID");
        cd.setContextKey("userId");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(segId);
        sc.setContextDefinitionId(cdId);
        sc.setContextValues("user-100,user-200,user-300");
        segmentContextRepository.save(sc);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Segment Only");
        flag.setKey("segment-only");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segId));
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        List<ClientFlagResponse.Constraint> constraints = result.get(0).getActivation().getConstraints();
        assertThat(constraints).isNull();
        List<ClientFlagResponse.Segment> segments = result.get(0).getActivation().getSegments();
        assertThat(segments).hasSize(1);
        assertThat(segments.get(0).getConstraints()).hasSize(1);
        assertThat(segments.get(0).getConstraints().get(0).getField()).isEqualTo("userId");
        assertThat(segments.get(0).getConstraints().get(0).getOperator()).isEqualTo("in");
        assertThat(segments.get(0).getConstraints().get(0).getValues()).containsExactly("user-100", "user-200", "user-300");
    }

    @Test
    void segmentAndStrategySameField_shouldKeepConstraintsSeparate() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("VIP Segment");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition cd = new ContextDefinition();
        cd.setName("User ID");
        cd.setContextKey("userId");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(segId);
        sc.setContextDefinitionId(cdId);
        sc.setContextValues("user-1,user-2,user-3");
        segmentContextRepository.save(sc);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Merged");
        flag.setKey("merged");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segId));
        s.setContextDefinitionId(cdId);
        s.setContextValuesJson("[{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"user-3\"},{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"user-4\"}]");
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        List<ClientFlagResponse.Constraint> constraints = result.get(0).getActivation().getConstraints();
        assertThat(constraints).hasSize(1);
        assertThat(constraints.get(0).getField()).isEqualTo("userId");
        assertThat(constraints.get(0).getOperator()).isEqualTo("in");
        assertThat(constraints.get(0).getValues()).containsExactly("user-3", "user-4");
        List<ClientFlagResponse.Segment> segments = result.get(0).getActivation().getSegments();
        assertThat(segments).hasSize(1);
        assertThat(segments.get(0).getConstraints()).hasSize(1);
        assertThat(segments.get(0).getConstraints().get(0).getValues()).containsExactly("user-1", "user-2", "user-3");
    }

    @Test
    void segmentAndStrategyDifferentFields_shouldReturnBothSeparately() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("EU Segment");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition countryCd = new ContextDefinition();
        countryCd.setName("Country");
        countryCd.setContextKey("country");
        countryCd.setProjectId(projectId);
        Integer countryCdId = contextDefinitionRepository.save(countryCd).getId();

        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(segId);
        sc.setContextDefinitionId(countryCdId);
        sc.setContextValues("DE,FR,IT");
        segmentContextRepository.save(sc);

        ContextDefinition userIdCd = new ContextDefinition();
        userIdCd.setName("User ID");
        userIdCd.setContextKey("userId");
        userIdCd.setProjectId(projectId);
        Integer userIdCdId = contextDefinitionRepository.save(userIdCd).getId();

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Two Fields");
        flag.setKey("two-fields");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segId));
        s.setContextDefinitionId(userIdCdId);
        s.setContextValuesJson("[{\"cd\":" + userIdCdId + ",\"op\":\"eq\",\"val\":\"user-42\"},{\"cd\":" + userIdCdId + ",\"op\":\"eq\",\"val\":\"user-99\"}]");
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        List<ClientFlagResponse.Constraint> constraints = result.get(0).getActivation().getConstraints();
        assertThat(constraints).hasSize(1);
        assertThat(constraints.get(0).getField()).isEqualTo("userId");
        assertThat(constraints.get(0).getOperator()).isEqualTo("eq");
        assertThat(constraints.get(0).getValues()).containsExactly("user-42", "user-99");
        List<ClientFlagResponse.Segment> segments = result.get(0).getActivation().getSegments();
        assertThat(segments).hasSize(1);
        assertThat(segments.get(0).getConstraints()).hasSize(1);
        assertThat(segments.get(0).getConstraints().get(0).getField()).isEqualTo("country");
        assertThat(segments.get(0).getConstraints().get(0).getValues()).containsExactly("DE", "FR", "IT");
    }

    @Test
    void segmentWithMultipleContextDefinitions_shouldReturnSegmentConstraints() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("Multi Context");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition countryCd = new ContextDefinition();
        countryCd.setName("Country");
        countryCd.setContextKey("country");
        countryCd.setProjectId(projectId);
        Integer countryCdId = contextDefinitionRepository.save(countryCd).getId();

        ContextDefinition platformCd = new ContextDefinition();
        platformCd.setName("Platform");
        platformCd.setContextKey("platform");
        platformCd.setProjectId(projectId);
        Integer platformCdId = contextDefinitionRepository.save(platformCd).getId();

        SegmentContext sc1 = new SegmentContext();
        sc1.setSegmentId(segId);
        sc1.setContextDefinitionId(countryCdId);
        sc1.setContextValues("US,CA");
        segmentContextRepository.save(sc1);

        SegmentContext sc2 = new SegmentContext();
        sc2.setSegmentId(segId);
        sc2.setContextDefinitionId(platformCdId);
        sc2.setContextValues("ios,android");
        segmentContextRepository.save(sc2);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Multi Ctx");
        flag.setKey("multi-ctx");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segId));
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        List<ClientFlagResponse.Constraint> constraints = result.get(0).getActivation().getConstraints();
        assertThat(constraints).isNull();
        List<ClientFlagResponse.Segment> segments = result.get(0).getActivation().getSegments();
        assertThat(segments).hasSize(1);
        assertThat(segments.get(0).getConstraints()).hasSize(2);
        assertThat(segments.get(0).getConstraints().get(0).getField()).isEqualTo("country");
        assertThat(segments.get(0).getConstraints().get(0).getValues()).containsExactly("US", "CA");
        assertThat(segments.get(0).getConstraints().get(1).getField()).isEqualTo("platform");
        assertThat(segments.get(0).getConstraints().get(1).getValues()).containsExactly("ios", "android");
    }

    @Test
    void segmentWithBlankValues_shouldSkipEmpty() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("Blank Vals");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition cd = new ContextDefinition();
        cd.setName("Region");
        cd.setContextKey("region");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(segId);
        sc.setContextDefinitionId(cdId);
        sc.setContextValues("east, ,west,,");
        segmentContextRepository.save(sc);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Blank");
        flag.setKey("blank");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segId));
        flagStrategyRepository.save(s);

        List<ClientFlagResponse> result = clientFlagService.getFlagsForProject(projectId, envId);

        assertThat(result).hasSize(1);
        List<ClientFlagResponse.Constraint> constraints = result.get(0).getActivation().getConstraints();
        assertThat(constraints).isNull();
        List<ClientFlagResponse.Segment> segments = result.get(0).getActivation().getSegments();
        assertThat(segments).hasSize(1);
        assertThat(segments.get(0).getConstraints()).hasSize(1);
        assertThat(segments.get(0).getConstraints().get(0).getValues()).containsExactly("east", "west");
    }

    @Test
    void evaluate_enabledFlagNoActivation_shouldReturnEnabled() {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Simple Flag");
        flag.setKey("simple-flag");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        flagRepository.save(flag);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of(), null, null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Simple Flag");
        assertThat(results.get(0).isEnabled()).isTrue();
    }

    @Test
    void evaluate_disabledFlag_shouldNotReturn() {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Off Flag");
        flag.setKey("off-flag");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(false);
        flagRepository.save(flag);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of(), null, null);

        assertThat(results).isEmpty();
    }

    @Test
    void evaluate_withConstraintMatches_shouldReturnFlag() {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("Plan");
        cd.setContextKey("plan");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Premium Flag");
        flag.setKey("premium-flag");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setContextDefinitionId(cdId);
        s.setContextValuesJson("[{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"premium\"}]");
        flagStrategyRepository.save(s);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of("plan", "premium"), null, null);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Premium Flag");
    }

    @Test
    void evaluate_withConstraintMismatches_shouldNotReturn() {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("Plan");
        cd.setContextKey("plan");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Premium Flag");
        flag.setKey("premium-flag");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setContextDefinitionId(cdId);
        s.setContextValuesJson("[{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"premium\"}]");
        flagStrategyRepository.save(s);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of("plan", "free"), null, null);
        assertThat(results).isEmpty();
    }

    @Test
    void evaluate_emptyProject_shouldReturnEmpty() {
        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of(), null, null);
        assertThat(results).isEmpty();
    }

    @Test
    void recordMetrics_withEvaluations_shouldNotThrow() {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Metrics Flag");
        flag.setKey("metrics-flag");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        flagRepository.save(flag);

        ClientMetricsRequest req = new ClientMetricsRequest();
        ClientMetricsRequest.EvalCount ec = new ClientMetricsRequest.EvalCount();
        ec.setTrueCount(2);
        ec.setFalseCount(1);
        req.setEvaluations(Map.of("metrics-flag", ec));

        clientFlagService.recordMetrics(projectId, envId, req, null);
    }

    @Test
    void recordMetrics_empty_shouldNotThrow() {
        ClientMetricsRequest req = new ClientMetricsRequest();
        clientFlagService.recordMetrics(projectId, envId, req, null);
    }

    @Test
    void evaluate_twoSegmentsDifferentContexts_userMatchesOne_shouldReturnFlag() {
        ContextDefinition userIdCd = new ContextDefinition();
        userIdCd.setName("User ID");
        userIdCd.setContextKey("userId");
        userIdCd.setProjectId(projectId);
        Integer userIdCdId = contextDefinitionRepository.save(userIdCd).getId();

        ContextDefinition planCd = new ContextDefinition();
        planCd.setName("Plan");
        planCd.setContextKey("plan");
        planCd.setProjectId(projectId);
        Integer planCdId = contextDefinitionRepository.save(planCd).getId();

        Segment segA = new Segment();
        segA.setProjectId(projectId);
        segA.setName("VIP Users");
        Integer segAId = segmentRepository.save(segA).getId();
        SegmentContext scA = new SegmentContext();
        scA.setSegmentId(segAId);
        scA.setContextDefinitionId(userIdCdId);
        scA.setContextValues("user-100,user-200");
        segmentContextRepository.save(scA);

        Segment segB = new Segment();
        segB.setProjectId(projectId);
        segB.setName("Premium Plan");
        Integer segBId = segmentRepository.save(segB).getId();
        SegmentContext scB = new SegmentContext();
        scB.setSegmentId(segBId);
        scB.setContextDefinitionId(planCdId);
        scB.setContextValues("premium,enterprise");
        segmentContextRepository.save(scB);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("OR Segments Flag");
        flag.setKey("or-segments-flag");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segAId, segBId));
        flagStrategyRepository.save(s);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(
            projectId, envId, Map.of("userId", "user-100"), null, null);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("OR Segments Flag");
    }

    @Test
    void evaluate_twoSegmentsDifferentContexts_userMatchesNone_shouldNotReturn() {
        ContextDefinition userIdCd = new ContextDefinition();
        userIdCd.setName("User ID");
        userIdCd.setContextKey("userId");
        userIdCd.setProjectId(projectId);
        Integer userIdCdId = contextDefinitionRepository.save(userIdCd).getId();

        ContextDefinition planCd = new ContextDefinition();
        planCd.setName("Plan");
        planCd.setContextKey("plan");
        planCd.setProjectId(projectId);
        Integer planCdId = contextDefinitionRepository.save(planCd).getId();

        Segment segA = new Segment();
        segA.setProjectId(projectId);
        segA.setName("VIP Users");
        Integer segAId = segmentRepository.save(segA).getId();
        SegmentContext scA = new SegmentContext();
        scA.setSegmentId(segAId);
        scA.setContextDefinitionId(userIdCdId);
        scA.setContextValues("user-100");
        segmentContextRepository.save(scA);

        Segment segB = new Segment();
        segB.setProjectId(projectId);
        segB.setName("Premium Plan");
        Integer segBId = segmentRepository.save(segB).getId();
        SegmentContext scB = new SegmentContext();
        scB.setSegmentId(segBId);
        scB.setContextDefinitionId(planCdId);
        scB.setContextValues("premium");
        segmentContextRepository.save(scB);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("No Match");
        flag.setKey("no-match");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segAId, segBId));
        flagStrategyRepository.save(s);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(
            projectId, envId, Map.of("userId", "not-in-list"), null, null);
        assertThat(results).isEmpty();
    }

    @Test
    void evaluate_twoSegmentsSameContext_userMatchesValueInEither_shouldReturnFlag() {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("User ID");
        cd.setContextKey("userId");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        Segment segA = new Segment();
        segA.setProjectId(projectId);
        segA.setName("VIP Users");
        Integer segAId = segmentRepository.save(segA).getId();
        SegmentContext scA = new SegmentContext();
        scA.setSegmentId(segAId);
        scA.setContextDefinitionId(cdId);
        scA.setContextValues("user-100,user-200");
        segmentContextRepository.save(scA);

        Segment segB = new Segment();
        segB.setProjectId(projectId);
        segB.setName("Beta Users");
        Integer segBId = segmentRepository.save(segB).getId();
        SegmentContext scB = new SegmentContext();
        scB.setSegmentId(segBId);
        scB.setContextDefinitionId(cdId);
        scB.setContextValues("user-300,user-400");
        segmentContextRepository.save(scB);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Same Context");
        flag.setKey("same-context");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segAId, segBId));
        flagStrategyRepository.save(s);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(
            projectId, envId, Map.of("userId", "user-300"), null, null);
        assertThat(results).hasSize(1);
    }

    @Test
    void evaluate_directConstraintAndSegment_userMatchesSegmentButNotDirect_shouldReturnFlag() {
        ContextDefinition userIdCd = new ContextDefinition();
        userIdCd.setName("User ID");
        userIdCd.setContextKey("userId");
        userIdCd.setProjectId(projectId);
        Integer userIdCdId = contextDefinitionRepository.save(userIdCd).getId();

        ContextDefinition planCd = new ContextDefinition();
        planCd.setName("Plan");
        planCd.setContextKey("plan");
        planCd.setProjectId(projectId);
        Integer planCdId = contextDefinitionRepository.save(planCd).getId();

        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("VIP");
        Integer segId = segmentRepository.save(seg).getId();
        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(segId);
        sc.setContextDefinitionId(userIdCdId);
        sc.setContextValues("user-100");
        segmentContextRepository.save(sc);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Direct + Segment");
        flag.setKey("direct-segment");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segId));
        s.setContextDefinitionId(planCdId);
        s.setContextValuesJson("[{\"cd\":" + planCdId + ",\"op\":\"in\",\"val\":\"premium\"}]");
        flagStrategyRepository.save(s);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(
            projectId, envId, Map.of("userId", "user-100"), null, null);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Direct + Segment");
    }

    @Test
    void evaluate_directConstraintAndSegment_userMatchesDirectButNotSegment_shouldReturnFlag() {
        ContextDefinition userIdCd = new ContextDefinition();
        userIdCd.setName("User ID");
        userIdCd.setContextKey("userId");
        userIdCd.setProjectId(projectId);
        Integer userIdCdId = contextDefinitionRepository.save(userIdCd).getId();

        ContextDefinition planCd = new ContextDefinition();
        planCd.setName("Plan");
        planCd.setContextKey("plan");
        planCd.setProjectId(projectId);
        Integer planCdId = contextDefinitionRepository.save(planCd).getId();

        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("VIP");
        Integer segId = segmentRepository.save(seg).getId();
        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(segId);
        sc.setContextDefinitionId(userIdCdId);
        sc.setContextValues("user-100");
        segmentContextRepository.save(sc);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Direct + Segment");
        flag.setKey("direct-segment");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segId));
        s.setContextDefinitionId(planCdId);
        s.setContextValuesJson("[{\"cd\":" + planCdId + ",\"op\":\"in\",\"val\":\"premium\"}]");
        flagStrategyRepository.save(s);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(
            projectId, envId, Map.of("plan", "premium"), null, null);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Direct + Segment");
    }

    @Test
    void evaluate_directConstraintAndSegment_neitherMatches_shouldNotReturn() {
        ContextDefinition userIdCd = new ContextDefinition();
        userIdCd.setName("User ID");
        userIdCd.setContextKey("userId");
        userIdCd.setProjectId(projectId);
        Integer userIdCdId = contextDefinitionRepository.save(userIdCd).getId();

        ContextDefinition planCd = new ContextDefinition();
        planCd.setName("Plan");
        planCd.setContextKey("plan");
        planCd.setProjectId(projectId);
        Integer planCdId = contextDefinitionRepository.save(planCd).getId();

        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("VIP");
        Integer segId = segmentRepository.save(seg).getId();
        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(segId);
        sc.setContextDefinitionId(userIdCdId);
        sc.setContextValues("user-100");
        segmentContextRepository.save(sc);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Direct + Segment");
        flag.setKey("direct-segment");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segId));
        s.setContextDefinitionId(planCdId);
        s.setContextValuesJson("[{\"cd\":" + planCdId + ",\"op\":\"in\",\"val\":\"premium\"}]");
        flagStrategyRepository.save(s);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(
            projectId, envId, Map.of("plan", "free"), null, null);
        assertThat(results).isEmpty();
    }

    @Test
    void evaluate_directConstraintAndSegment_bothMatch_shouldReturnFlag() {
        ContextDefinition userIdCd = new ContextDefinition();
        userIdCd.setName("User ID");
        userIdCd.setContextKey("userId");
        userIdCd.setProjectId(projectId);
        Integer userIdCdId = contextDefinitionRepository.save(userIdCd).getId();

        ContextDefinition planCd = new ContextDefinition();
        planCd.setName("Plan");
        planCd.setContextKey("plan");
        planCd.setProjectId(projectId);
        Integer planCdId = contextDefinitionRepository.save(planCd).getId();

        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("VIP");
        Integer segId = segmentRepository.save(seg).getId();
        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(segId);
        sc.setContextDefinitionId(userIdCdId);
        sc.setContextValues("user-100");
        segmentContextRepository.save(sc);

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Both Match");
        flag.setKey("both-match");
        flag.setFlagType(FlagType.RELEASE);
        flag.setEnabled(true);
        Flag saved = flagRepository.save(flag);

        FlagStrategy s = new FlagStrategy();
        s.setFlagId(saved.getId());
        s.setEnvironmentId(envId);
        s.setEnabled(true);
        s.setSegmentIds(List.of(segId));
        s.setContextDefinitionId(planCdId);
        s.setContextValuesJson("[{\"cd\":" + planCdId + ",\"op\":\"in\",\"val\":\"premium\"}]");
        flagStrategyRepository.save(s);

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(
            projectId, envId, Map.of("userId", "user-100", "plan", "premium"), null, null);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Both Match");
    }
}
