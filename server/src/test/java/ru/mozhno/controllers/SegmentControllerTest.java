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
import ru.mozhno.projects.Project;
import ru.mozhno.segments.Segment;
import ru.mozhno.segments.SegmentRequest;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class SegmentControllerTest extends BaseIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Integer projectId;
    private Integer contextDefId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();

        Project p = new Project();
        p.setName("Test Project");
        projectId = projectRepository.save(p).getId();

        ContextDefinition cd = new ContextDefinition();
        cd.setName("appName");
        cd.setProjectId(projectId);
        contextDefId = contextDefinitionRepository.save(cd).getId();
    }

    @Test
    void getAllSegments_shouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/projects/{projectId}/segments", projectId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createSegment_shouldReturnCreated() throws Exception {
        SegmentRequest req = new SegmentRequest();
        req.setName("Power Users");
        req.setDescription("High-value users");
        SegmentRequest.ContextEntry entry = new SegmentRequest.ContextEntry();
        entry.setContextDefinitionId(contextDefId);
        entry.setContextValues("[\"web\",\"mobile\"]");
        req.setContext(List.of(entry));

        mockMvc.perform(post("/api/v1/projects/{projectId}/segments", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Power Users"))
                .andExpect(jsonPath("$.context").isArray())
                .andExpect(jsonPath("$.context[0].contextDefinitionId").value(contextDefId));
    }

    @Test
    void createSegment_withoutContext_shouldReturnCreated() throws Exception {
        SegmentRequest req = new SegmentRequest();
        req.setName("Empty Segment");
        req.setDescription("No context");
        req.setContext(List.of());

        mockMvc.perform(post("/api/v1/projects/{projectId}/segments", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Empty Segment"))
                .andExpect(jsonPath("$.context").isArray());
    }

    @Test
    void getSegmentById_shouldReturnSegment() throws Exception {
        Segment s = new Segment();
        s.setName("Power Users");
        s.setProjectId(projectId);
        Segment saved = segmentRepository.save(s);

        mockMvc.perform(get("/api/v1/projects/{projectId}/segments/{id}", projectId, saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Power Users"));
    }

    @Test
    void updateSegment_shouldReturnUpdated() throws Exception {
        Segment s = new Segment();
        s.setName("Old Name");
        s.setProjectId(projectId);
        Segment saved = segmentRepository.save(s);

        SegmentRequest req = new SegmentRequest();
        req.setName("Updated Name");
        req.setDescription("Updated description");
        SegmentRequest.ContextEntry entry = new SegmentRequest.ContextEntry();
        entry.setContextDefinitionId(contextDefId);
        entry.setContextValues("[\"mobile\"]");
        req.setContext(List.of(entry));

        mockMvc.perform(put("/api/v1/projects/{projectId}/segments/{id}", projectId, saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.context[0].contextValues").value("[\"mobile\"]"));
    }

    @Test
    void updateSegment_shouldReplaceContext() throws Exception {
        Segment s = new Segment();
        s.setName("With Context");
        s.setProjectId(projectId);
        Segment saved = segmentRepository.save(s);

        SegmentRequest reqWithContext = new SegmentRequest();
        reqWithContext.setName("Replaced Context");
        reqWithContext.setDescription("Test");
        SegmentRequest.ContextEntry entry = new SegmentRequest.ContextEntry();
        entry.setContextDefinitionId(contextDefId);
        entry.setContextValues("[\"web\"]");
        reqWithContext.setContext(List.of(entry));

        mockMvc.perform(put("/api/v1/projects/{projectId}/segments/{id}", projectId, saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqWithContext)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.context.length()").value(1));

        SegmentRequest reqEmpty = new SegmentRequest();
        reqEmpty.setName("Empty Context");
        reqEmpty.setDescription("Test");
        reqEmpty.setContext(List.of());

        mockMvc.perform(put("/api/v1/projects/{projectId}/segments/{id}", projectId, saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqEmpty)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.context.length()").value(0));
    }

    @Test
    void deleteSegment_shouldReturn204() throws Exception {
        Segment s = new Segment();
        s.setName("To Delete");
        s.setProjectId(projectId);
        Segment saved = segmentRepository.save(s);

        mockMvc.perform(delete("/api/v1/projects/{projectId}/segments/{id}", projectId, saved.getId()))
                .andExpect(status().isNoContent());
    }
}