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
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagType;
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FlagControllerTest extends BaseIntegrationTest {

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
            "flag-test@test.com", passwordEncoder.encode("secret"), "developer", "active");

        String loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"flag-test@test.com\",\"password\":\"secret\"}"))
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
    void getFlags_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/flags", projectId)
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createFlag_shouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/flags", projectId)
                        .header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{" +
                            "\"name\": \"New Feature\"," +
                            "\"key\": \"new-feature\"," +
                            "\"description\": \"A new feature\"," +
                            "\"flagType\": \"RELEASE\"" +
                            "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Feature"))
                .andExpect(jsonPath("$.key").value("new-feature"));
    }

    @Test
    void getFlag_shouldReturnFlag() throws Exception {
        Flag flag = new Flag();
        flag.setName("Test Flag");
        flag.setKey("test-flag");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        mockMvc.perform(get("/api/v1/projects/{projectId}/flags/{id}", projectId, saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Flag"));
    }

    @Test
    void updateFlag_shouldReturnUpdated() throws Exception {
        Flag flag = new Flag();
        flag.setName("Original");
        flag.setKey("original");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        mockMvc.perform(put("/api/v1/projects/{projectId}/flags/{id}", projectId, saved.getId())
                        .header("Authorization", auth())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{" +
                            "\"name\": \"Updated\"," +
                            "\"key\": \"updated\"," +
                            "\"description\": \"Updated\"," +
                            "\"flagType\": \"KILLSWITCH\"" +
                            "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    void deleteFlag_shouldReturn204() throws Exception {
        Flag flag = new Flag();
        flag.setName("ToDelete");
        flag.setKey("to-delete");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        mockMvc.perform(delete("/api/v1/projects/{projectId}/flags/{id}", projectId, saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isNoContent());
    }

    @Test
    void archiveFlag_shouldReturnOk() throws Exception {
        Flag flag = new Flag();
        flag.setName("ToArchive");
        flag.setKey("to-archive");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        mockMvc.perform(post("/api/v1/projects/{projectId}/flags/{id}/archive", projectId, saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.archived").value(true));
    }

    @Test
    void unarchiveFlag_shouldReturnOk() throws Exception {
        Flag flag = new Flag();
        flag.setName("ToUnarchive");
        flag.setKey("to-unarchive");
        flag.setProjectId(projectId);
        flag.setFlagType(FlagType.RELEASE);
        Flag saved = flagRepository.save(flag);

        flagRepository.setArchived(saved.getId(), true);

        mockMvc.perform(post("/api/v1/projects/{projectId}/flags/{id}/unarchive", projectId, saved.getId())
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.archived").value(false));
    }

    @Test
    void getFlags_shouldExcludeArchivedByDefault() throws Exception {
        Flag active = new Flag();
        active.setName("Active");
        active.setKey("active");
        active.setProjectId(projectId);
        active.setFlagType(FlagType.RELEASE);
        flagRepository.save(active);

        Flag archived = new Flag();
        archived.setName("Archived");
        archived.setKey("archived");
        archived.setProjectId(projectId);
        archived.setFlagType(FlagType.RELEASE);
        Flag savedArchived = flagRepository.save(archived);
        flagRepository.setArchived(savedArchived.getId(), true);

        mockMvc.perform(get("/api/v1/projects/{projectId}/flags", projectId)
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Active"));
    }

    @Test
    void getFlags_withIncludeArchived_shouldReturnAll() throws Exception {
        Flag active = new Flag();
        active.setName("Active");
        active.setKey("active");
        active.setProjectId(projectId);
        active.setFlagType(FlagType.RELEASE);
        flagRepository.save(active);

        Flag archived = new Flag();
        archived.setName("Archived");
        archived.setKey("archived");
        archived.setProjectId(projectId);
        archived.setFlagType(FlagType.RELEASE);
        Flag savedArchived = flagRepository.save(archived);
        flagRepository.setArchived(savedArchived.getId(), true);

        mockMvc.perform(get("/api/v1/projects/{projectId}/flags?includeArchived=true", projectId)
                .header("Authorization", auth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
