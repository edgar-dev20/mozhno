package ru.mozhno.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import ru.mozhno.BaseIntegrationTest;
import ru.mozhno.apikeys.ApiKey;
import ru.mozhno.contexts.ContextDefinition;
import ru.mozhno.contexts.ContextDefinitionRepository;
import ru.mozhno.environments.Environment;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagType;
import ru.mozhno.flags.strategy.TargetingStrategy;
import ru.mozhno.flags.strategy.ServerStrategy;
import ru.mozhno.flags.strategy.FlagStrategyRepository;
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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

        ServerStrategy strategy = new ServerStrategy();
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
                .andExpect(jsonPath("$[0].activation.type").value("server"))
                .andExpect(jsonPath("$[0].activation.constraint").doesNotExist());
    }

    @Test
    void getFeatures_withSegmentStrategy_shouldReturnConstraint() throws Exception {
        ContextDefinition cd = new ContextDefinition();
        cd.setName("userId");
        cd.setProjectId(projectId);
        Integer cdId = contextDefinitionRepository.save(cd).getId();

        Flag flag2 = new Flag();
        flag2.setProjectId(projectId);
        flag2.setName("Segment Feature");
        flag2.setKey("segment-feature");
        flag2.setFlagType(FlagType.RELEASE);
        Flag savedFlag2 = flagRepository.save(flag2);

        TargetingStrategy strategy = new TargetingStrategy();
        strategy.setFlagId(savedFlag2.getId());
        strategy.setEnvironmentId(envId);
        strategy.setEnabled(true);
        strategy.setContextDefinitionId(cdId);
        strategy.setContextValuesJson("[\"user-123\",\"user-456\"]");
        flagStrategyRepository.save(strategy);

        mockMvc.perform(get("/api/client/features")
                        .header("Authorization", "client-test-token-abcdefghijklmnop1234567890"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[1].name").value("Segment Feature"))
                .andExpect(jsonPath("$[1].activation.type").value("targeting"))
                .andExpect(jsonPath("$[1].activation.constraint.field").value("userId"))
                .andExpect(jsonPath("$[1].activation.constraint.values").isArray())
                .andExpect(jsonPath("$[1].activation.constraint.values.length()").value(2));
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

        ServerStrategy strategyProd = new ServerStrategy();
        strategyProd.setFlagId(savedFlag2.getId());
        strategyProd.setEnvironmentId(envId);
        strategyProd.setEnabled(true);
        flagStrategyRepository.save(strategyProd);

        ServerStrategy strategyStaging = new ServerStrategy();
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
}