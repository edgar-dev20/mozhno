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
import ru.mozhno.tags.Tag;
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TagControllerTest extends BaseIntegrationTest {

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
            "tag-test@test.com", passwordEncoder.encode("secret"), "developer", "active");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"tag-test@test.com\",\"password\":\"secret\"}"))
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
    void getTags_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/tags", projectId)
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createTag_shouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/tags", projectId)
                        .header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"release\", \"description\": \"Release tag\", \"color\": \"#00FF00\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("release"))
                .andExpect(jsonPath("$.color").value("#00FF00"));
    }

    @Test
    void getTag_shouldReturnTag() throws Exception {
        Tag tag = new Tag();
        tag.setName("Test Tag");
        tag.setColor("#FF0000");
        tag.setProjectId(projectId);
        Tag saved = tagRepository.save(tag);

        mockMvc.perform(get("/api/v1/projects/{projectId}/tags/{id}", projectId, saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Tag"));
    }

    @Test
    void updateTag_shouldReturnUpdated() throws Exception {
        Tag tag = new Tag();
        tag.setName("Original");
        tag.setColor("#000000");
        tag.setProjectId(projectId);
        Tag saved = tagRepository.save(tag);

        mockMvc.perform(put("/api/v1/projects/{projectId}/tags/{id}", projectId, saved.getId())
                        .header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Updated\", \"description\": \"Updated\", \"color\": \"#00FF00\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    void deleteTag_shouldReturn204() throws Exception {
        Tag tag = new Tag();
        tag.setName("ToDelete");
        tag.setColor("#000000");
        tag.setProjectId(projectId);
        Tag saved = tagRepository.save(tag);

        mockMvc.perform(delete("/api/v1/projects/{projectId}/tags/{id}", projectId, saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isNoContent());
    }
}
