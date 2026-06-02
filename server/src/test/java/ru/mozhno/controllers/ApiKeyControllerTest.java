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
import ru.mozhno.apikeys.ApiKey;
import ru.mozhno.environments.Environment;
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ApiKeyControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Integer projectId;
    private Integer environmentId;
    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();

        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            "apikey-test@test.com", passwordEncoder.encode("secret"), "editor");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"apikey-test@test.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        authToken = objectMapper.readTree(loginResponse).get("token").asText();

        Project p = new Project();
        p.setName("Test Project");
        projectId = projectRepository.save(p).getId();

        Environment env = new Environment();
        env.setName("development");
        env.setProjectId(projectId);
        environmentId = environmentRepository.save(env).getId();
    }

    @Test
    void getAllApiKeys_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/api-keys", projectId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createApiKey_shouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/api-keys", projectId)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format(
                            "{\"name\": \"My Service\", \"environmentId\": %d, \"description\": \"Test service\"}",
                            environmentId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("My Service"))
                .andExpect(jsonPath("$.apiKey").isNotEmpty());
    }

    @Test
    void getApiKey_shouldReturnApiKey() throws Exception {
        ApiKey k = new ApiKey();
        k.setProjectId(projectId);
        k.setName("Staging Service");
        k.setApiKey("test-key-1234567890");
        ApiKey saved = apiKeyRepository.save(k);

        mockMvc.perform(get("/api/v1/projects/{projectId}/api-keys/{id}", projectId, saved.getId())
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Staging Service"));
    }

    @Test
    void getApiKey_shouldReturn404WhenNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/api-keys/9999", projectId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateApiKey_shouldReturnUpdated() throws Exception {
        ApiKey k = new ApiKey();
        k.setProjectId(projectId);
        k.setName("Original Name");
        k.setApiKey("original-key-1234567890");
        ApiKey saved = apiKeyRepository.save(k);

        mockMvc.perform(put("/api/v1/projects/{projectId}/api-keys/{id}", projectId, saved.getId())
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format(
                            "{\"name\": \"Updated Name\", \"environmentId\": %d, \"description\": \"Updated\"}",
                            environmentId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    void deleteApiKey_shouldReturn204() throws Exception {
        ApiKey k = new ApiKey();
        k.setProjectId(projectId);
        k.setName("To Delete");
        k.setApiKey("delete-me-key-1234567890");
        ApiKey saved = apiKeyRepository.save(k);

        mockMvc.perform(delete("/api/v1/projects/{projectId}/api-keys/{id}", projectId, saved.getId())
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNoContent());
    }
}