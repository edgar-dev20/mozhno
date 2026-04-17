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
        cd.setName("userId");
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
    void segmentConstraintOnly_shouldReturnConstraints() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("VIP Users");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition cd = new ContextDefinition();
        cd.setName("userId");
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
        assertThat(constraints).hasSize(1);
        assertThat(constraints.get(0).getField()).isEqualTo("userId");
        assertThat(constraints.get(0).getOperator()).isEqualTo("in");
        assertThat(constraints.get(0).getValues()).containsExactly("user-100", "user-200", "user-300");
    }

    @Test
    void segmentAndStrategySameField_shouldMergeAndDedup() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("VIP Segment");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition cd = new ContextDefinition();
        cd.setName("userId");
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
        assertThat(constraints.get(0).getValues()).containsExactly("user-1", "user-2", "user-3", "user-4");
    }

    @Test
    void segmentAndStrategyDifferentFields_shouldReturnBoth() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("EU Segment");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition countryCd = new ContextDefinition();
        countryCd.setName("country");
        countryCd.setProjectId(projectId);
        Integer countryCdId = contextDefinitionRepository.save(countryCd).getId();

        SegmentContext sc = new SegmentContext();
        sc.setSegmentId(segId);
        sc.setContextDefinitionId(countryCdId);
        sc.setContextValues("DE,FR,IT");
        segmentContextRepository.save(sc);

        ContextDefinition userIdCd = new ContextDefinition();
        userIdCd.setName("userId");
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
        assertThat(constraints).hasSize(2);
        assertThat(constraints.get(0).getField()).isEqualTo("country");
        assertThat(constraints.get(0).getOperator()).isEqualTo("in");
        assertThat(constraints.get(0).getValues()).containsExactly("DE", "FR", "IT");
        assertThat(constraints.get(1).getField()).isEqualTo("userId");
        assertThat(constraints.get(1).getOperator()).isEqualTo("eq");
        assertThat(constraints.get(1).getValues()).containsExactly("user-42", "user-99");
    }

    @Test
    void segmentWithMultipleContextDefinitions_shouldReturnMultipleConstraints() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("Multi Context");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition countryCd = new ContextDefinition();
        countryCd.setName("country");
        countryCd.setProjectId(projectId);
        Integer countryCdId = contextDefinitionRepository.save(countryCd).getId();

        ContextDefinition platformCd = new ContextDefinition();
        platformCd.setName("platform");
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
        assertThat(constraints).hasSize(2);
        assertThat(constraints.get(0).getField()).isEqualTo("country");
        assertThat(constraints.get(0).getValues()).containsExactly("US", "CA");
        assertThat(constraints.get(1).getField()).isEqualTo("platform");
        assertThat(constraints.get(1).getValues()).containsExactly("ios", "android");
    }

    @Test
    void segmentWithBlankValues_shouldSkipEmpty() {
        Segment seg = new Segment();
        seg.setProjectId(projectId);
        seg.setName("Blank Vals");
        Integer segId = segmentRepository.save(seg).getId();

        ContextDefinition cd = new ContextDefinition();
        cd.setName("region");
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
        assertThat(constraints).hasSize(1);
        assertThat(constraints.get(0).getValues()).containsExactly("east", "west");
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

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of());

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

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of());

        assertThat(results).isEmpty();
    }

    @Test
    void evaluate_withConstraintMatches_shouldReturnFlag() {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("plan");
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

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of("plan", "premium"));
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Premium Flag");
    }

    @Test
    void evaluate_withConstraintMismatches_shouldNotReturn() {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("plan");
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

        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of("plan", "free"));
        assertThat(results).isEmpty();
    }

    @Test
    void evaluate_emptyProject_shouldReturnEmpty() {
        List<ClientEvaluateResponse.ToggleResult> results = clientFlagService.evaluate(projectId, envId, Map.of());
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
        req.setEvaluations(Map.of("metrics-flag", 3L));

        clientFlagService.recordMetrics(projectId, envId, req);
    }

    @Test
    void recordMetrics_empty_shouldNotThrow() {
        ClientMetricsRequest req = new ClientMetricsRequest();
        clientFlagService.recordMetrics(projectId, envId, req);
    }
}