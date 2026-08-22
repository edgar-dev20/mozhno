package dev.mozhno.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.apikeys.ApiKey;
import dev.mozhno.contexts.ContextDefinition;
import dev.mozhno.contexts.ContextDefinitionRepository;
import dev.mozhno.environments.Environment;
import dev.mozhno.flags.Flag;
import dev.mozhno.flags.FlagType;
import dev.mozhno.flags.strategy.FlagStrategy;
import dev.mozhno.flags.strategy.FlagStrategyRepository;
import dev.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

class ClientFlagControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private ApiKey apiKey;
    private Integer projectId;
    private Integer envId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        Project p = new Project();
        p.setName("Client Project");
        projectId = projectRepository.save(p).getId();

        Environment env = new Environment();
        env.setName("production");
        env.setProjectId(projectId);
        envId = environmentRepository.save(env).getId();

        Flag flag = new Flag();
        flag.setProjectId(projectId);
        flag.setName("Test Feature");
        flag.setKey("test-feature");
        flag.setFlagType(FlagType.RELEASE);
        Flag savedFlag = flagRepository.save(flag);

        FlagStrategy strategy = new FlagStrategy();
        strategy.setFlagId(savedFlag.getId());
        strategy.setEnvironmentId(envId);
        strategy.setEnabled(true);
        flagStrategyRepository.save(strategy);

        apiKey = new ApiKey();
        apiKey.setProjectId(projectId);
        apiKey.setName("Test Client");
        apiKey.setApiKey("client-test-token-abcdefghijklmnop1234567890");
        apiKey.setEnvironmentId(envId);
        apiKey = apiKeyRepository.save(apiKey);
    }

    @Test
    void getFeatures_withValidApiKeyWithBearer_shouldReturnFlags() throws Exception {
        mockMvc.perform(get("/api/client/features")
                        .header("Authorization", "Bearer client-test-token-abcdefghijklmnop1234567890"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Feature"))
                .andExpect(jsonPath("$[0].key").value("test-feature"))
                .andExpect(jsonPath("$[0].enabled").value(true))
                .andExpect(jsonPath("$[0].activation").exists())
                .andExpect(jsonPath("$[0].activation.constraints").doesNotExist());
    }

    @Test
    void getFeatures_withContextConstraint_shouldReturnConstraint() throws Exception {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("User ID");
        cd.setContextKey("userId");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        Flag flag2 = new Flag();
        flag2.setProjectId(projectId);
        flag2.setName("Segment Feature");
        flag2.setKey("segment-feature");
        flag2.setFlagType(FlagType.RELEASE);
        Flag savedFlag2 = flagRepository.save(flag2);

        FlagStrategy strategy = new FlagStrategy();
        strategy.setFlagId(savedFlag2.getId());
        strategy.setEnvironmentId(envId);
        strategy.setEnabled(true);
        strategy.setContextDefinitionId(cdId);
        strategy.setContextValuesJson("[{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"user-123\"},{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"user-456\"}]");
        flagStrategyRepository.save(strategy);

        mockMvc.perform(get("/api/client/features")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[1].name").value("Segment Feature"))
                .andExpect(jsonPath("$[1].activation.constraints[0].field").value("userId"))
                .andExpect(jsonPath("$[1].activation.constraints[0].values").isArray())
                .andExpect(jsonPath("$[1].activation.constraints[0].values.length()").value(2));
    }

    @Test
    void getFeatures_withValidApiKeyWithoutBearer_shouldReturnFlags() throws Exception {
        mockMvc.perform(get("/api/client/features")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Feature"))
                .andExpect(jsonPath("$[0].enabled").value(true));
    }

    @Test
    void getFeatures_withInvalidApiKey_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/client/features")
                        .header("Authorization", "invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getFeatures_withoutApiKey_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/client/features"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getFeatures_apiKeyWithEnvironmentId_shouldReturnOnlyMatchingStrategy() throws Exception {
        Environment staging = new Environment();
        staging.setName("staging");
        staging.setProjectId(projectId);
        Integer stagingId = environmentRepository.save(staging).getId();

        Flag flag2 = new Flag();
        flag2.setProjectId(projectId);
        flag2.setName("Staging Feature");
        flag2.setKey("staging-feature");
        flag2.setFlagType(FlagType.RELEASE);
        Flag savedFlag2 = flagRepository.save(flag2);

        FlagStrategy strategyProd = new FlagStrategy();
        strategyProd.setFlagId(savedFlag2.getId());
        strategyProd.setEnvironmentId(envId);
        strategyProd.setEnabled(true);
        flagStrategyRepository.save(strategyProd);

        FlagStrategy strategyStaging = new FlagStrategy();
        strategyStaging.setFlagId(savedFlag2.getId());
        strategyStaging.setEnvironmentId(stagingId);
        strategyStaging.setEnabled(false);
        flagStrategyRepository.save(strategyStaging);

        mockMvc.perform(get("/api/client/features")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].enabled").value(true))
                .andExpect(jsonPath("$[1].enabled").value(true));
    }

    @Test
    void evaluate_withContext_shouldReturnEnabledFlags() throws Exception {
        mockMvc.perform(post("/api/client/evaluate")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890")
                        .contentType("application/json")
                        .content("{\"context\":{\"userId\":\"test-user\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.toggles").isArray())
                .andExpect(jsonPath("$.toggles[0].name").value("test-feature"))
                .andExpect(jsonPath("$.toggles[0].enabled").value(true));
    }

    @Test
    void evaluate_withNoContext_shouldStillReturnEnabled() throws Exception {
        mockMvc.perform(post("/api/client/evaluate")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.toggles").isArray());
    }

    @Test
    void evaluate_withConstraintMatch_shouldReturnFlag() throws Exception {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("Country");
        cd.setContextKey("country");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        Flag flag2 = new Flag();
        flag2.setProjectId(projectId);
        flag2.setName("Constrained Feature");
        flag2.setKey("constrained-feature");
        flag2.setFlagType(FlagType.RELEASE);
        Flag savedFlag2 = flagRepository.save(flag2);

        FlagStrategy strategy = new FlagStrategy();
        strategy.setFlagId(savedFlag2.getId());
        strategy.setEnvironmentId(envId);
        strategy.setEnabled(true);
        strategy.setContextDefinitionId(cdId);
        strategy.setContextValuesJson("[{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"RU\"}]");
        flagStrategyRepository.save(strategy);

        mockMvc.perform(post("/api/client/evaluate")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890")
                        .contentType("application/json")
                        .content("{\"context\":{\"country\":\"RU\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.toggles", hasSize(2)))
                .andExpect(jsonPath("$.toggles[?(@.name=='constrained-feature')].enabled", hasItem(true)));
    }

    @Test
    void evaluate_withConstraintMismatch_shouldNotReturnFlag() throws Exception {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("Country");
        cd.setContextKey("country");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        Flag flag2 = new Flag();
        flag2.setProjectId(projectId);
        flag2.setName("Constrained Feature");
        flag2.setKey("constrained-feature");
        flag2.setFlagType(FlagType.RELEASE);
        Flag savedFlag2 = flagRepository.save(flag2);

        FlagStrategy strategy = new FlagStrategy();
        strategy.setFlagId(savedFlag2.getId());
        strategy.setEnvironmentId(envId);
        strategy.setEnabled(true);
        strategy.setContextDefinitionId(cdId);
        strategy.setContextValuesJson("[{\"cd\":" + cdId + ",\"op\":\"in\",\"val\":\"RU\"}]");
        flagStrategyRepository.save(strategy);

        mockMvc.perform(post("/api/client/evaluate")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890")
                        .contentType("application/json")
                        .content("{\"context\":{\"country\":\"US\"}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.toggles", hasSize(1)));
    }

    @Test
    void evaluate_withToggleFilter_shouldReturnOnlyRequested() throws Exception {
        mockMvc.perform(post("/api/client/evaluate")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890")
                        .contentType("application/json")
                        .content("{\"toggles\":[\"test-feature\"],\"context\":{}}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.toggles", hasSize(1)))
                .andExpect(jsonPath("$.toggles[0].name").value("test-feature"));
    }

    @Test
    void evaluate_withoutAuth_shouldReturn401() throws Exception {
        mockMvc.perform(post("/api/client/evaluate")
                        .contentType("application/json")
                        .content("{\"context\":{}}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void submitMetrics_shouldReturnAccepted() throws Exception {
        mockMvc.perform(post("/api/client/metrics")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890")
                        .contentType("application/json")
                        .content("{\"evaluations\":{\"test-feature\":{\"t\":3,\"f\":2}}}"))
                .andExpect(status().isAccepted());
    }

    @Test
    void submitMetrics_empty_shouldReturnAccepted() throws Exception {
        mockMvc.perform(post("/api/client/metrics")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isAccepted());
    }
}