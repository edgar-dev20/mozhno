package dev.mozhno.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.environments.Environment;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagType;
import dev.mozhno.metrics.FlagMetric;
import dev.mozhno.metrics.FlagMetricRepository;
import dev.mozhno.metrics.FlagMetricsService;
import dev.mozhno.projects.Project;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FlagMetricsServiceTest extends BaseIntegrationTest {

    @Autowired
    private FlagMetricsService flagMetricsService;

    @Autowired
    private FlagMetricRepository flagMetricRepository;

    private Integer projectId;
    private Integer envId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("Metrics Project");
        projectId = projectRepository.save(p).getId();

        Environment env = new Environment();
        env.setName("production");
        env.setProjectId(projectId);
        envId = environmentRepository.save(env).getId();
    }

    @Test
    void getMetrics_empty_shouldReturnEmpty() {
        List<FlagMetric> result = flagMetricsService.getMetrics(1, envId);
        assertThat(result).isEmpty();
    }

    @Test
    void getProjectMetrics_empty_shouldReturnEmpty() {
        List<FlagMetric> result = flagMetricsService.getProjectMetrics(projectId, envId);
        assertThat(result).isEmpty();
    }

    @Test
    void getProjectMetrics_allEnvironments_shouldWork() {
        List<FlagMetric> result = flagMetricsService.getProjectMetrics(projectId, null);
        assertThat(result).isEmpty();
    }

    @Test
    void getMetrics_afterEvaluation_shouldReturnMetrics() {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("My Flag");
        flag.setKey("my-flag");
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        flagMetricRepository.recordEvaluation(projectId, saved.getId(), envId, true);
        flagMetricRepository.recordEvaluation(projectId, saved.getId(), envId, false);

        List<FlagMetric> result = flagMetricsService.getMetrics(saved.getId(), envId);
        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getEvaluationTrueCount()).isGreaterThanOrEqualTo(1);
        assertThat(result.get(0).getEvaluationFalseCount()).isGreaterThanOrEqualTo(1);
    }
}
