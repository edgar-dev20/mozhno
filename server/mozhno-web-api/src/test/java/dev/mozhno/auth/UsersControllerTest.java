package dev.mozhno.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import dev.mozhno.BaseIntegrationTest;
import dev.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UsersControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private String authToken;
    private Integer testProjectId;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        objectMapper = new ObjectMapper();

        Project p = new Project();
        p.setName("Test Project");
        testProjectId = projectRepository.save(p).getId();

        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status, project_id) VALUES (?, ?, ?, ?, ?)",
            "users-admin@test.com", passwordEncoder.encode("secret"), "admin", "active", testProjectId);

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"users-admin@test.com\",\"password\":\"secret\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        authToken = objectMapper.readTree(loginResponse).get("token").asText();
    }

    private String auth() {
        return "Bearer " + authToken;
    }

    private int insertUser(String email, String role) {
        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status, project_id) VALUES (?, ?, ?, ?, ?)",
            email, passwordEncoder.encode("Pass1234!"), role, "active", testProjectId);
        return jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, email);
    }

    @Test
    void getAllUsers_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getById_shouldReturnUser() throws Exception {
        int userId = insertUser("getuser@test.com", "viewer");

        mockMvc.perform(get("/api/v1/users/{id}", userId)
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("getuser@test.com"));
    }

    @Test
    void getById_shouldReturn404WhenNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/users/99999")
                .header("Authorization", auth()))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateUser_shouldReturnUpdatedUser() throws Exception {
        int userId = insertUser("update@test.com", "viewer");

        mockMvc.perform(put("/api/v1/users/{id}", userId)
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Updated Name\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    void deleteUser_shouldReturn204() throws Exception {
        int userId = insertUser("todelete@test.com", "viewer");

        mockMvc.perform(delete("/api/v1/users/{id}", userId)
                .header("Authorization", auth()))
                .andExpect(status().isNoContent());
    }

    @Test
    void invite_shouldReturn201AndMessage() throws Exception {
        mockMvc.perform(post("/api/v1/users/invite")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"invited@test.com\",\"role\":\"developer\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Invitation sent to invited@test.com"));
    }

    @Test
    void invite_shouldReturn400ForDuplicateEmail() throws Exception {
        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status, project_id) VALUES (?, ?, ?, ?, ?)",
            "existing@test.com", passwordEncoder.encode("pass"), "developer", "active", testProjectId);

        mockMvc.perform(post("/api/v1/users/invite")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"existing@test.com\",\"role\":\"viewer\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void invite_shouldReturn400ForInvalidRole() throws Exception {
        mockMvc.perform(post("/api/v1/users/invite")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"rolebad@test.com\",\"role\":\"superadmin\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void invite_shouldReturn403ForNonAdmin() throws Exception {
        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status, project_id) VALUES (?, ?, ?, ?, ?)",
            "viewer-user@test.com", passwordEncoder.encode("viewpass"), "viewer", "active", testProjectId);

        String viewerLoginResp = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"viewer-user@test.com\",\"password\":\"viewpass\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String viewerToken = objectMapper.readTree(viewerLoginResp).get("token").asText();

        mockMvc.perform(post("/api/v1/users/invite")
                .header("Authorization", "Bearer " + viewerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nomail@test.com\",\"role\":\"viewer\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void sendResetLink_shouldReturn200() throws Exception {
        int userId = insertUser("resetme@test.com", "viewer");

        mockMvc.perform(post("/api/v1/users/{id}/send-reset-link", userId)
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset link sent"));
    }

    @Test
    void sendResetLink_shouldReturn404ForUnknownUser() throws Exception {
        mockMvc.perform(post("/api/v1/users/99999/send-reset-link")
                .header("Authorization", auth()))
                .andExpect(status().isNotFound());
    }

    @Test
    void sendResetLink_shouldReturn403ForNonAdmin() throws Exception {
        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status, project_id) VALUES (?, ?, ?, ?, ?)",
            "viewer2@test.com", passwordEncoder.encode("viewpass"), "viewer", "active", testProjectId);

        String viewerLoginResp = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"viewer2@test.com\",\"password\":\"viewpass\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String viewerToken = objectMapper.readTree(viewerLoginResp).get("token").asText();

        mockMvc.perform(post("/api/v1/users/1/send-reset-link")
                .header("Authorization", "Bearer " + viewerToken))
                .andExpect(status().isForbidden());
    }
}
