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
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProjectControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void getAllProjects_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createProject_shouldReturnCreatedProject() throws Exception {
        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Test Project\", \"description\": \"Test Description\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Project"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    void getProject_shouldReturnProject() throws Exception {
        Project p = new Project();
        p.setName("Find Test");
        p.setDescription("Description");
        Project saved = projectRepository.save(p);

        mockMvc.perform(get("/api/v1/projects/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Find Test"));
    }

    @Test
    void getProject_shouldReturn404WhenNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/projects/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateProject_shouldReturnUpdatedProject() throws Exception {
        Project p = new Project();
        p.setName("Original");
        Project saved = projectRepository.save(p);

        mockMvc.perform(put("/api/v1/projects/{id}", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Updated\", \"description\": \"Updated Description\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    void deleteProject_shouldReturn204() throws Exception {
        Project p = new Project();
        p.setName("To Delete");
        Project saved = projectRepository.save(p);

        mockMvc.perform(delete("/api/v1/projects/{id}", saved.getId()))
                .andExpect(status().isNoContent());
    }
}