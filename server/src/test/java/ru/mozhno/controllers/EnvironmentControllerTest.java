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
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class EnvironmentControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Integer projectId;
    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity()).build();
        objectMapper = new ObjectMapper();

        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
            "env-test@test.com", passwordEncoder.encode("secret"), "admin", "active");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"env-test@test.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        authToken = objectMapper.readTree(loginResponse).get("token").asText();

        Project p = new Project();
        p.setName("Test Project");
        projectId = projectRepository.save(p).getId();
    }

    private String auth() {
        return "Bearer " + authToken;
    }

    @Test
    void getEnvironments_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/environments", projectId)
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createEnvironment_shouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/environments", projectId)
                        .header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"development\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("development"));
    }

    @Test
    void getEnvironment_shouldReturnEnvironment() throws Exception {
        Environment env = new Environment();
        env.setName("staging");
        env.setProjectId(projectId);
        Environment saved = environmentRepository.save(env);

        mockMvc.perform(get("/api/v1/projects/{projectId}/environments/{id}", projectId, saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("staging"));
    }

    @Test
    void updateEnvironment_shouldReturnUpdated() throws Exception {
        Environment env = new Environment();
        env.setName("old");
        env.setProjectId(projectId);
        Environment saved = environmentRepository.save(env);

        mockMvc.perform(put("/api/v1/projects/{projectId}/environments/{id}", projectId, saved.getId())
                        .header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"updated\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("updated"));
    }

    @Test
    void deleteEnvironment_shouldReturn204() throws Exception {
        Environment env = new Environment();
        env.setName("toDelete");
        env.setProjectId(projectId);
        Environment saved = environmentRepository.save(env);

        mockMvc.perform(delete("/api/v1/projects/{projectId}/environments/{id}", projectId, saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isNoContent());
    }
}
