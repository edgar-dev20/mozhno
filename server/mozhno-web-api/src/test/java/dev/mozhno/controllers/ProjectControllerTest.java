package dev.mozhno.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.projects.Project;

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

        Project p = new Project();
        p.setName("Test Project");
        Integer projectId = projectRepository.save(p).getId();
        jdbcTemplate.update("UPDATE users SET project_id = ? WHERE email = ?", projectId, "project-test@test.com");

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
    void getAllProjects_shouldReturnProject() throws Exception {
        mockMvc.perform(get("/api/v1/projects")
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Project"));
    }

    @Test
    void updateProject_shouldReturnUpdatedProject() throws Exception {
        mockMvc.perform(put("/api/v1/projects")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\": \"Updated\", \"description\": \"Updated Description\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    void resetProject_shouldReturnMyProject() throws Exception {
        mockMvc.perform(post("/api/v1/projects/reset")
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("My Project"))
                .andExpect(jsonPath("$.logo").doesNotExist());
    }

    @Test
    void getClientInstances_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/client-instances")
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getClientInstances_withEnvironmentId_shouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/client-instances")
                .param("environmentId", "1")
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void uploadLogo_shouldReturnProject() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", pngBytes());

        mockMvc.perform(MockMvcRequestBuilders.multipart("/api/v1/projects/logo")
                .file(file)
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logo").isNotEmpty());
    }

    @Test
    void getLogo_shouldReturn404WhenNoLogo() throws Exception {
        mockMvc.perform(get("/api/v1/projects/logo")
                .header("Authorization", auth()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteProject_shouldReturn405MethodNotAllowed() throws Exception {
        mockMvc.perform(delete("/api/v1/projects")
                .header("Authorization", auth()))
                .andExpect(status().isMethodNotAllowed());
    }

    private static byte[] pngBytes() {
        try {
            var img = new java.awt.image.BufferedImage(1, 1, java.awt.image.BufferedImage.TYPE_INT_RGB);
            img.setRGB(0, 0, 0xFF0000);
            var out = new java.io.ByteArrayOutputStream();
            javax.imageio.ImageIO.write(img, "PNG", out);
            return out.toByteArray();
        } catch (java.io.IOException e) {
            throw new RuntimeException(e);
        }
    }
}
