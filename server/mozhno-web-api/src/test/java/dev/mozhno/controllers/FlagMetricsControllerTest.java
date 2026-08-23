package dev.mozhno.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.client.ClientInstanceRepository;
import dev.mozhno.environments.Environment;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagType;
import dev.mozhno.metrics.FlagMetricRepository;
import dev.mozhno.projects.Project;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FlagMetricsControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ClientInstanceRepository clientInstanceRepository;

    @Autowired
    private FlagMetricRepository flagMetricRepository;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private String authToken;
    private Integer projectId;
    private Integer envId;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
            .apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity())
            .build();
        objectMapper = new ObjectMapper();

        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
            "metrics-test@test.com", passwordEncoder.encode("secret"), "admin", "active");

        Project p = new Project();
        p.setName("Metrics Test Project");
        projectId = projectRepository.save(p).getId();
        jdbcTemplate.update("UPDATE users SET project_id = ? WHERE email = ?", projectId, "metrics-test@test.com");

        Environment env = new Environment();
        env.setName("production");
        env.setProjectId(projectId);
        envId = environmentRepository.save(env).getId();

        jdbcTemplate.execute("DELETE FROM flag_metrics");
        jdbcTemplate.execute("DELETE FROM client_instances");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"metrics-test@test.com\",\"password\":\"secret\"}"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();

        authToken = objectMapper.readTree(loginResponse).get("token").asText();
    }

    private String auth() {
        return "Bearer " + authToken;
    }

    private Integer createFlag(String key) {
        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName(key);
        flag.setKey(key);
        flag.setFlagType(FlagType.RELEASE);
        return flagRepository.save(flag).getId();
    }

    @Test
    void getContributors_empty_shouldReturnEmptyArray() throws Exception {
        Integer flagId = createFlag("empty-metrics-flag");

        mockMvc.perform(get("/api/v1/flags/{flagId}/metrics/contributors", flagId)
                .param("environmentId", envId.toString())
                .header("Authorization", auth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getContributors_shouldReturnContributorSummaries() throws Exception {
        Integer flagId = createFlag("contrib-metrics-flag");
        Long instanceId = clientInstanceRepository.upsert(
            projectId, envId, null, "web-app", "inst-a", "java", "2.4.0", "SERVER");

        flagMetricRepository.recordEvaluation(projectId, flagId, envId, true, instanceId);
        flagMetricRepository.recordEvaluation(projectId, flagId, envId, true, instanceId);
        flagMetricRepository.recordEvaluation(projectId, flagId, envId, true, instanceId);
        flagMetricRepository.recordEvaluation(projectId, flagId, envId, false, instanceId);

        mockMvc.perform(get("/api/v1/flags/{flagId}/metrics/contributors", flagId)
                .param("environmentId", envId.toString())
                .header("Authorization", auth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$[0].appName").value("web-app"))
            .andExpect(jsonPath("$[0].sdkInstanceId").value("inst-a"))
            .andExpect(jsonPath("$[0].appType").value("java"))
            .andExpect(jsonPath("$[0].sdkVersion").value("2.4.0"))
            .andExpect(jsonPath("$[0].instanceId").isNumber())
            .andExpect(jsonPath("$[0].lastSeenAt").isNotEmpty())
            .andExpect(jsonPath("$[0].evaluationTrueCount").value(3))
            .andExpect(jsonPath("$[0].evaluationFalseCount").value(1));
    }

    @Test
    void getContributors_shouldOrderByContributionDescending() throws Exception {
        Integer flagId = createFlag("ordered-metrics-flag");
        Long topId = clientInstanceRepository.upsert(
            projectId, envId, null, "top-app", "inst-top", "java", "2.4.0", "SERVER");
        Long lowId = clientInstanceRepository.upsert(
            projectId, envId, null, "low-app", "inst-low", "js", "1.8.0", "FRONTEND");

        flagMetricRepository.recordEvaluations(projectId, flagId, envId, 100, 0, topId);
        flagMetricRepository.recordEvaluations(projectId, flagId, envId, 1, 0, lowId);

        mockMvc.perform(get("/api/v1/flags/{flagId}/metrics/contributors", flagId)
                .param("environmentId", envId.toString())
                .header("Authorization", auth()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].sdkInstanceId").value("inst-top"))
            .andExpect(jsonPath("$[1].sdkInstanceId").value("inst-low"));
    }
}
