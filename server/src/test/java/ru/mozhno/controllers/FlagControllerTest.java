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
import ru.mozhno.flags.Flag;
import ru.mozhno.flags.FlagType;
import ru.mozhno.projects.Project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class FlagControllerTest extends BaseIntegrationTest {

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
    void getFlags_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/flags", projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createFlag_shouldReturnCreated() throws Exception {
        mockMvc.perform(post("/api/v1/projects/{projectId}/flags", projectId)
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

        mockMvc.perform(get("/api/v1/projects/{projectId}/flags/{id}", projectId, saved.getId()))
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

        mockMvc.perform(delete("/api/v1/projects/{projectId}/flags/{id}", projectId, saved.getId()))
                .andExpect(status().isNoContent());
    }
}