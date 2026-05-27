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
import ru.mozhno.contexts.ContextDefinition;
import ru.mozhno.contexts.ContextValue;
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ContextControllerTest extends BaseIntegrationTest {

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
    void getDefinitions_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/contexts", projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createDefinition_shouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/contexts", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"userId\", \"description\": \"User identifier\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("userId"));
    }

    @Test
    void getDefinition_shouldReturnDefinition() throws Exception {
        ContextDefinition ctx = new ContextDefinition();
        ctx.setName("appName");
        ctx.setProjectId(projectId);
        ContextDefinition saved = contextDefinitionRepository.save(ctx);

        mockMvc.perform(get("/api/v1/projects/{projectId}/contexts/{id}", projectId, saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("appName"));
    }

    @Test
    void updateDefinition_shouldReturnUpdated() throws Exception {
        ContextDefinition ctx = new ContextDefinition();
        ctx.setName("original");
        ctx.setProjectId(projectId);
        ContextDefinition saved = contextDefinitionRepository.save(ctx);

        mockMvc.perform(put("/api/v1/projects/{projectId}/contexts/{id}", projectId, saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"updated\", \"description\": \"Updated description\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("updated"));
    }

    @Test
    void deleteDefinition_shouldReturn204() throws Exception {
        ContextDefinition ctx = new ContextDefinition();
        ctx.setName("toDelete");
        ctx.setProjectId(projectId);
        ContextDefinition saved = contextDefinitionRepository.save(ctx);

        mockMvc.perform(delete("/api/v1/projects/{projectId}/contexts/{id}", projectId, saved.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void getValues_shouldReturnValues() throws Exception {
        ContextDefinition ctx = new ContextDefinition();
        ctx.setName("userId");
        ctx.setProjectId(projectId);
        ContextDefinition saved = contextDefinitionRepository.save(ctx);

        ContextValue cv = new ContextValue();
        cv.setContextDefinitionId(saved.getId());
        cv.setValues("[\"user1\",\"user2\"]");
        contextValueRepository.save(cv);

        mockMvc.perform(get("/api/v1/projects/{projectId}/contexts/{id}/values", projectId, saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createValue_shouldReturnCreated() throws Exception {
        ContextDefinition ctx = new ContextDefinition();
        ctx.setName("userId");
        ctx.setProjectId(projectId);
        ContextDefinition saved = contextDefinitionRepository.save(ctx);

        String json = "{\"contextDefinitionId\": " + saved.getId() + ", \"values\": \"[\\\"new-user\\\"]\"}";

        mockMvc.perform(post("/api/v1/projects/{projectId}/contexts/{id}/values", projectId, saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated());
    }
}