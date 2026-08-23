package dev.mozhno.metrics;

import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.client.ClientInstanceRepository;
import dev.mozhno.environments.Environment;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagType;
import dev.mozhno.projects.Project;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FlagMetricRepositoryTest extends BaseIntegrationTest {

    @Autowired
    private FlagMetricRepository repository;

    @Autowired
    private ClientInstanceRepository clientInstanceRepository;

    private Integer projectId;
    private Integer envId;

    @BeforeEach
    void setUp() {
        Project p = new Project();
        p.setName("Metrics Repo Project");
        projectId = projectRepository.save(p).getId();

        Environment env = new Environment();
        env.setName("production");
        env.setProjectId(projectId);
        envId = environmentRepository.save(env).getId();

        jdbcTemplate.execute("DELETE FROM flag_metrics");
        jdbcTemplate.execute("DELETE FROM client_instances");
    }

    private Flag createFlag(String key) {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName(key);
        flag.setKey(key);
        flag.setFlagType(FlagType.RELEASE);
        return flagRepository.save(flag);
    }

    private Long createInstance(String appName, String instanceId) {
        return clientInstanceRepository.upsert(projectId, envId, null, appName, instanceId, "java", "2.4.0", "SERVER");
    }

    @Test
    void findContributors_empty_shouldReturnEmpty() {
        Flag flag = createFlag("empty-flag");
        List<FlagContributor> result = repository.findContributors(flag.getId(), envId, Instant.now().minus(48, ChronoUnit.HOURS));
        assertThat(result).isEmpty();
    }

    @Test
    void findContributors_shouldReturnInstanceWithSums() {
        Flag flag = createFlag("contrib-flag");
        Long instanceId = createInstance("web-app", "inst-a");

        repository.recordEvaluation(projectId, flag.getId(), envId, true, instanceId);
        repository.recordEvaluation(projectId, flag.getId(), envId, true, instanceId);
        repository.recordEvaluation(projectId, flag.getId(), envId, false, instanceId);

        List<FlagContributor> result = repository.findContributors(flag.getId(), envId, Instant.now().minus(48, ChronoUnit.HOURS));
        assertThat(result).hasSize(1);
        FlagContributor c = result.get(0);
        assertThat(c.instanceId()).isEqualTo(instanceId);
        assertThat(c.sdkInstanceId()).isEqualTo("inst-a");
        assertThat(c.appName()).isEqualTo("web-app");
        assertThat(c.appType()).isEqualTo("java");
        assertThat(c.sdkVersion()).isEqualTo("2.4.0");
        assertThat(c.lastSeenAt()).isNotNull();
        assertThat(c.evaluationTrueCount()).isEqualTo(2);
        assertThat(c.evaluationFalseCount()).isEqualTo(1);
        assertThat(c.totalEvaluations()).isEqualTo(3);
    }

    @Test
    void findContributors_shouldSumAcrossTimeBuckets() {
        Flag flag = createFlag("multi-bucket-flag");
        Long instanceId = createInstance("web-app", "inst-a");

        repository.recordEvaluation(projectId, flag.getId(), envId, true, instanceId);
        jdbcTemplate.update("""
            INSERT INTO flag_metrics (project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket, client_instance_id)
            VALUES (?, ?, ?, ?, ?, NOW() - INTERVAL '3 hours', ?)
            """, projectId, flag.getId(), envId, 100, 50, instanceId);

        List<FlagContributor> result = repository.findContributors(flag.getId(), envId, Instant.now().minus(48, ChronoUnit.HOURS));
        assertThat(result).hasSize(1);
        assertThat(result.get(0).evaluationTrueCount()).isEqualTo(101);
        assertThat(result.get(0).evaluationFalseCount()).isEqualTo(50);
    }

    @Test
    void findContributors_shouldFilterByFlagAndEnvironment() {
        Flag flagA = createFlag("flag-a");
        Flag flagB = createFlag("flag-b");
        Long instanceId = createInstance("web-app", "inst-a");

        Environment env2 = new Environment();
        env2.setName("staging");
        env2.setProjectId(projectId);
        Integer env2Id = environmentRepository.save(env2).getId();

        repository.recordEvaluation(projectId, flagA.getId(), envId, true, instanceId);
        repository.recordEvaluation(projectId, flagB.getId(), envId, true, instanceId);
        repository.recordEvaluation(projectId, flagA.getId(), env2Id, true, instanceId);

        List<FlagContributor> forFlagA = repository.findContributors(flagA.getId(), envId, Instant.now().minus(48, ChronoUnit.HOURS));
        assertThat(forFlagA).hasSize(1);
        assertThat(forFlagA.get(0).evaluationTrueCount()).isEqualTo(1);

        List<FlagContributor> forFlagB = repository.findContributors(flagB.getId(), envId, Instant.now().minus(48, ChronoUnit.HOURS));
        assertThat(forFlagB).hasSize(1);

        List<FlagContributor> forEnv2 = repository.findContributors(flagA.getId(), env2Id, Instant.now().minus(48, ChronoUnit.HOURS));
        assertThat(forEnv2).hasSize(1);
    }

    @Test
    void findContributors_shouldOrderByTotalContributionDescending() {
        Flag flag = createFlag("ordered-flag");
        Long top = createInstance("top-app", "inst-top");
        Long mid = createInstance("mid-app", "inst-mid");
        Long low = createInstance("low-app", "inst-low");

        repository.recordEvaluations(projectId, flag.getId(), envId, 100, 100, top);
        repository.recordEvaluations(projectId, flag.getId(), envId, 40, 40, mid);
        repository.recordEvaluations(projectId, flag.getId(), envId, 5, 0, low);

        List<FlagContributor> result = repository.findContributors(flag.getId(), envId, Instant.now().minus(48, ChronoUnit.HOURS));
        assertThat(result).hasSize(3);
        assertThat(result.get(0).sdkInstanceId()).isEqualTo("inst-top");
        assertThat(result.get(1).sdkInstanceId()).isEqualTo("inst-mid");
        assertThat(result.get(2).sdkInstanceId()).isEqualTo("inst-low");
    }

    @Test
    void findContributors_shouldIgnoreAggregatedRows() {
        Flag flag = createFlag("agg-flag");
        repository.recordEvaluation(projectId, flag.getId(), envId, true, null);

        List<FlagContributor> result = repository.findContributors(flag.getId(), envId, Instant.now().minus(48, ChronoUnit.HOURS));
        assertThat(result).isEmpty();
    }

    @Test
    void findContributors_shouldRespectSinceWindow() {
        Flag flag = createFlag("window-flag");
        Long instanceId = createInstance("web-app", "inst-a");

        repository.recordEvaluation(projectId, flag.getId(), envId, true, instanceId);
        jdbcTemplate.update("""
            INSERT INTO flag_metrics (project_id, flag_id, environment_id, evaluation_true_count, evaluation_false_count, time_bucket, client_instance_id)
            VALUES (?, ?, ?, ?, ?, NOW() - INTERVAL '100 hours', ?)
            """, projectId, flag.getId(), envId, 100, 0, instanceId);

        List<FlagContributor> result = repository.findContributors(flag.getId(), envId, Instant.now().minus(48, ChronoUnit.HOURS));
        assertThat(result).hasSize(1);
        assertThat(result.get(0).evaluationTrueCount()).isEqualTo(1);
    }
}
