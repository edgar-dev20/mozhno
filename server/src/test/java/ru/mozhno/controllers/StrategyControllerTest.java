package ru.mozhno.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import ru.mozhno.BaseIntegrationTest;
import ru.mozhno.environments.Environment;
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagType;
import ru.mozhno.flags.strategy.ServerStrategy;
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class StrategyControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Integer flagId;
    private Integer environmentId;
    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();

        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            "strategy-test@test.com", passwordEncoder.encode("secret"), "editor");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"strategy-test@test.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        authToken = objectMapper.readTree(loginResponse).get("token").asText();

        Project p = new Project();
        p.setName("Test Project");
        Project saved = projectRepository.save(p);

        Environment env = new Environment();
        env.setName("development");
        env.setProjectId(saved.getId());
        environmentId = environmentRepository.save(env).getId();

        Flag flag = new Flag();
        flag.setName("Test Flag");
        flag.setKey("test-flag");
        flag.setProjectId(saved.getId());
        flag.setFlagType(FlagType.RELEASE);
        flagId = flagRepository.save(flag).getId();
    }

    @Test
    void getStrategies_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/flags/{flagId}/strategies", flagId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createStrategy_shouldReturnCreated() throws Exception {
        String json = "{" +
            "\"flagId\": " + flagId + "," +
            "\"environmentId\": " + environmentId + "," +
            "\"type\": \"SERVER\"," +
            "\"enabled\": true" +
            "}";

        mockMvc.perform(post("/api/v1/flags/{flagId}/strategies", flagId)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.strategyType").value("SERVER"))
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    void updateStrategy_shouldReturnUpdated() throws Exception {
        ServerStrategy strategy = new ServerStrategy();
        strategy.setFlagId(flagId);
        strategy.setEnvironmentId(environmentId);
        strategy.setEnabled(false);
        var saved = flagStrategyRepository.save(strategy);

        mockMvc.perform(put("/api/v1/flags/{flagId}/strategies/{id}", flagId, saved.getId())
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\": \"SERVER\", \"enabled\": true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    void deleteStrategy_shouldReturn204() throws Exception {
        ServerStrategy strategy = new ServerStrategy();
        strategy.setFlagId(flagId);
        strategy.setEnvironmentId(environmentId);
        strategy.setEnabled(true);
        var saved = flagStrategyRepository.save(strategy);

        mockMvc.perform(delete("/api/v1/flags/{flagId}/strategies/{id}", flagId, saved.getId())
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNoContent());
    }
}