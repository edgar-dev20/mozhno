package ru.mozhno.segments;

import java.time.Instant;

public class SegmentContext {
    private Integer id;
    private Integer segmentId;
    private Integer contextDefinitionId;
    private String contextValues;
    private Instant createdAt;

    public SegmentContext() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getSegmentId() { return segmentId; }
    public void setSegmentId(Integer segmentId) { this.segmentId = segmentId; }
    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getContextValues() { return contextValues; }
    public void setContextValues(String contextValues) { this.contextValues = contextValues; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}