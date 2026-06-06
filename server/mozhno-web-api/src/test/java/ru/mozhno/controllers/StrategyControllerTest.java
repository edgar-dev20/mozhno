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
import ru.mozhno.flags.strategy.FlagStrategy;
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
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity()).build();
        objectMapper = new ObjectMapper();

        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
            "strategy-test@test.com", passwordEncoder.encode("secret"), "developer", "active");

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

    private String auth() {
        return "Bearer " + authToken;
    }

    @Test
    void getStrategies_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/flags/{flagId}/strategies", flagId)
                        .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createStrategy_shouldReturnCreated() throws Exception {
        String json = "{" +
            "\"flagId\": " + flagId + "," +
            "\"environmentId\": " + environmentId + "," +
            "\"enabled\": true" +
            "}";

        mockMvc.perform(post("/api/v1/flags/{flagId}/strategies", flagId)
                        .header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    void updateStrategy_shouldReturnUpdated() throws Exception {
        FlagStrategy strategy = new FlagStrategy();
        strategy.setFlagId(flagId);
        strategy.setEnvironmentId(environmentId);
        strategy.setEnabled(false);
        var saved = flagStrategyRepository.save(strategy);

        mockMvc.perform(put("/api/v1/flags/{flagId}/strategies/{id}", flagId, saved.getId())
                        .header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enabled\": true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    void deleteStrategy_shouldReturn204() throws Exception {
        FlagStrategy strategy = new FlagStrategy();
        strategy.setFlagId(flagId);
        strategy.setEnvironmentId(environmentId);
        strategy.setEnabled(true);
        var saved = flagStrategyRepository.save(strategy);

        mockMvc.perform(delete("/api/v1/flags/{flagId}/strategies/{id}", flagId, saved.getId())
                        .header("Authorization", auth()))
                .andExpect(status().isNoContent());
    }
}
