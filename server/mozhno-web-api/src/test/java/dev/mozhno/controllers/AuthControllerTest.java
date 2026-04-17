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
import dev.mozhno.auth.JwtProperties;
import dev.mozhno.auth.JwtService;
import dev.mozhno.auth.JwtToken;
import dev.mozhno.auth.User;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
        objectMapper = new ObjectMapper();
    }

    private void insertUser(String email, String password, String role) {
        jdbcTemplate.update(
            "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
            email, passwordEncoder.encode(password), role);
    }

    @Test
    void login_shouldReturnUserAndToken() throws Exception {
        insertUser("login@test.com", "secret123", "editor");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"login@test.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("login@test.com"))
                .andExpect(jsonPath("$.user.role").value("editor"))
                .andExpect(jsonPath("$.user.id").isNumber());
    }

    @Test
    void login_shouldReturn401ForInvalidPassword() throws Exception {
        insertUser("badpw@test.com", "correct", "viewer");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"badpw@test.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void login_shouldReturn401ForInvalidEmail() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nobody@test.com\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void login_shouldValidateEmailFormat() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"not-an-email\",\"password\":\"password\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_shouldRequireFields() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void me_shouldReturn401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_shouldReturnUserWithValidToken() throws Exception {
        insertUser("me@test.com", "mypassword", "viewer");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"me@test.com\",\"password\":\"mypassword\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(loginResponse).get("token").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me@test.com"))
                .andExpect(jsonPath("$.role").value("viewer"));
    }

    @Test
    void me_shouldRejectInvalidToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_shouldRejectExpiredToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtb3pubm8tdGVzdCIsInN1YiI6InRlc3QiLCJleHAiOjE2MDAwMDAwMDB9.signature"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void apiV1Endpoints_shouldRequireAuth() throws Exception {
        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void apiV1Endpoints_shouldAllowAccessWithValidToken() throws Exception {
        insertUser("api@test.com", "apipass", "admin");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"api@test.com\",\"password\":\"apipass\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(loginResponse).get("token").asText();

        mockMvc.perform(get("/api/v1/projects")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void forgotPassword_shouldReturn200ForValidEmail() throws Exception {
        insertUser("forgot@test.com", "pass", "viewer");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"forgot@test.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void forgotPassword_shouldReturn200ForNonExistentEmail() throws Exception {
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nobody@test.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void forgotPassword_shouldReturn400ForInvalidEmailFormat() throws Exception {
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"not-an-email\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resetPassword_shouldReturn400ForInvalidToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"invalid-token\",\"password\":\"newpassword123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void resetPassword_shouldReturn200ForValidToken() throws Exception {
        insertUser("reset@test.com", "oldpass", "viewer");
        Integer userId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, "reset@test.com");

        String rawToken = "test-reset-token-value";
        String tokenHash = dev.mozhno.client.HashUtils.sha256(rawToken);
        jdbcTemplate.update(
            "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
            userId, tokenHash, java.sql.Timestamp.from(java.time.Instant.now().plus(1, java.time.temporal.ChronoUnit.HOURS)));

        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + rawToken + "\",\"password\":\"newpassword123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password has been reset successfully"));
    }

    @Test
    void resetPassword_shouldReturn400ForExpiredToken() throws Exception {
        insertUser("expired-reset@test.com", "pass", "viewer");
        Integer userId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, "expired-reset@test.com");

        String rawToken = "expired-reset-token-value";
        String tokenHash = dev.mozhno.client.HashUtils.sha256(rawToken);
        jdbcTemplate.update(
            "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
            userId, tokenHash, java.sql.Timestamp.from(java.time.Instant.now().minus(1, java.time.temporal.ChronoUnit.HOURS)));

        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + rawToken + "\",\"password\":\"newpassword123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void resetPassword_shouldReturn400ForAlreadyUsedToken() throws Exception {
        insertUser("used-reset@test.com", "pass", "viewer");
        Integer userId = jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, "used-reset@test.com");

        String rawToken = "already-used-reset-token";
        String tokenHash = dev.mozhno.client.HashUtils.sha256(rawToken);
        jdbcTemplate.update(
            "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
            userId, tokenHash, java.sql.Timestamp.from(java.time.Instant.now().plus(1, java.time.temporal.ChronoUnit.HOURS)));

        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + rawToken + "\",\"password\":\"newpassword123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void acceptInvite_shouldReturn400ForInvalidToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/accept-invite")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"bad-invite-token\",\"name\":\"Test\",\"password\":\"password123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void acceptInvite_shouldReturnUserDtoForValidToken() throws Exception {
        String rawToken = "test-invite-token-value";
        String tokenHash = dev.mozhno.client.HashUtils.sha256(rawToken);
        jdbcTemplate.update(
            "INSERT INTO invite_tokens (email, role, token_hash, expires_at) VALUES (?, ?, ?, ?)",
            "invited@test.com", "editor", tokenHash,
            java.sql.Timestamp.from(java.time.Instant.now().plus(6, java.time.temporal.ChronoUnit.DAYS)));

        mockMvc.perform(post("/api/v1/auth/accept-invite")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"" + rawToken + "\",\"name\":\"Invited User\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("invited@test.com"))
                .andExpect(jsonPath("$.role").value("editor"))
                .andExpect(jsonPath("$.status").value("active"));
    }

    @Test
    void refresh_shouldPreserveProjectIdFromExpiredJwt() throws Exception {
        jdbcTemplate.update("INSERT INTO projects (name) VALUES (?)", "Test Project");
        int projectId = jdbcTemplate.queryForObject("SELECT id FROM projects WHERE name = ?", Integer.class, "Test Project");

        insertUser("refresh-pid@test.com", "secret123", "admin");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"refresh-pid@test.com\",\"password\":\"secret123\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String refreshToken = objectMapper.readTree(loginResponse).get("refreshToken").asText();

        JwtProperties expiredProps = new JwtProperties();
        expiredProps.setSecret("dGhpc2lzYXRlc3RzZWNyZXRrZXlmb3Jqd3R0aGF0aXNhdGxlYXN0MzJieXRlc2xvbmc=");
        expiredProps.setIssuer("mozhno-test");
        expiredProps.setAccessTokenTtlMinutes(0);

        JwtService expiredJwtService = new JwtService(expiredProps);
        User user = new User();
        user.setId(jdbcTemplate.queryForObject("SELECT id FROM users WHERE email = ?", Integer.class, "refresh-pid@test.com"));
        user.setEmail("refresh-pid@test.com");
        user.setRole("admin");
        user.setStatus("active");

        String expiredJwt = expiredJwtService.generateAccessToken(user, projectId);

        String refreshResponse = mockMvc.perform(post("/api/v1/auth/refresh")
                .header("Authorization", "Bearer " + expiredJwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String newToken = objectMapper.readTree(refreshResponse).get("token").asText();
        JwtToken parsed = jwtService.parseToken(newToken);
        assertEquals(projectId, parsed.getProjectId());
    }
}