package ru.mozhno.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
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

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Integer projectId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();

        Project p = new Project();
        p.setName("Test Project");
        projectId = projectRepository.save(p).getId();
    }

    @Test
    void getEnvironments_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/environments", projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createEnvironment_shouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/environments", projectId)
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

        mockMvc.perform(get("/api/v1/projects/{projectId}/environments/{id}", projectId, saved.getId()))
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

        mockMvc.perform(delete("/api/v1/projects/{projectId}/environments/{id}", projectId, saved.getId()))
                .andExpect(status().isNoContent());
    }
}