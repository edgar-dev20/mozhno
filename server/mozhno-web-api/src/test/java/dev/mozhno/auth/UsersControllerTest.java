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

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        objectMapper = new ObjectMapper();

        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
            "users-admin@test.com", passwordEncoder.encode("secret"), "admin", "active");

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

    @Test
    void getAllUsers_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createUser_shouldReturnCreatedUser() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"newuser@test.com\",\"password\":\"newpass123\",\"name\":\"New User\",\"role\":\"editor\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("newuser@test.com"))
                .andExpect(jsonPath("$.role").value("editor"));
    }

    @Test
    void createUser_shouldReturnErrorWhenEmailExists() throws Exception {
        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
            "dup@test.com", passwordEncoder.encode("pass1"), "editor", "active");

        mockMvc.perform(post("/api/v1/users")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"dup@test.com\",\"password\":\"newpass\",\"name\":\"Dup\",\"role\":\"viewer\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void getById_shouldReturnUser() throws Exception {
        ObjectMapper om = new ObjectMapper();
        String createResp = mockMvc.perform(post("/api/v1/users")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"getuser@test.com\",\"password\":\"pass1234\",\"name\":\"Get Me\",\"role\":\"viewer\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        int userId = om.readTree(createResp).get("id").asInt();

        mockMvc.perform(get("/api/v1/users/{id}", userId)
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("getuser@test.com"));
    }

    @Test
    void updateUser_shouldReturnUpdatedUser() throws Exception {
        ObjectMapper om = new ObjectMapper();
        String createResp = mockMvc.perform(post("/api/v1/users")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"update@test.com\",\"password\":\"pass1234\",\"name\":\"Old\",\"role\":\"viewer\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        int userId = om.readTree(createResp).get("id").asInt();

        mockMvc.perform(put("/api/v1/users/{id}", userId)
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Updated Name\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    void deleteUser_shouldReturn204() throws Exception {
        ObjectMapper om = new ObjectMapper();
        String createResp = mockMvc.perform(post("/api/v1/users")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"todelete@test.com\",\"password\":\"pass1234\",\"name\":\"Del\",\"role\":\"viewer\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        int userId = om.readTree(createResp).get("id").asInt();

        mockMvc.perform(delete("/api/v1/users/{id}", userId)
                .header("Authorization", auth()))
                .andExpect(status().isNoContent());
    }

    @Test
    void getById_shouldReturn404WhenNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/users/99999")
                .header("Authorization", auth()))
                .andExpect(status().isNotFound());
    }

    @Test
    void invite_shouldReturn201AndMessage() throws Exception {
        mockMvc.perform(post("/api/v1/users/invite")
                .header("Authorization", auth())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"invited@test.com\",\"role\":\"editor\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Invitation sent to invited@test.com"));
    }

    @Test
    void invite_shouldReturn400ForDuplicateEmail() throws Exception {
        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
            "existing@test.com", passwordEncoder.encode("pass"), "editor", "active");

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
    void invite_shouldReturn400ForNonAdmin() throws Exception {
        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)",
            "viewer-user@test.com", passwordEncoder.encode("viewpass"), "viewer", "active");

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
}
