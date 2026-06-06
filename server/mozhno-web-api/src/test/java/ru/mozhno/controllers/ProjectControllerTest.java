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
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProjectControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).apply(org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity()).build();
        objectMapper = new ObjectMapper();

        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
            "project-test@test.com", passwordEncoder.encode("secret"), "admin", "active");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"project-test@test.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        authToken = objectMapper.readTree(loginResponse).get("token").asText();
    }

    private String auth() {
        return "Bearer " + authToken;
    }

    @Test
    void getAllProjects_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/v1/projects")
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createProject_shouldReturnCreatedProject() throws Exception {
        mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", auth())
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

        mockMvc.perform(get("/api/v1/projects/{id}", saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Find Test"));
    }

    @Test
    void getProject_shouldReturn404WhenNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/projects/9999")
                .header("Authorization", auth()))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateProject_shouldReturnUpdatedProject() throws Exception {
        Project p = new Project();
        p.setName("Original");
        Project saved = projectRepository.save(p);

        mockMvc.perform(put("/api/v1/projects/{id}", saved.getId())
                        .header("Authorization", auth())
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

        mockMvc.perform(delete("/api/v1/projects/{id}", saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isNoContent());
    }
}
