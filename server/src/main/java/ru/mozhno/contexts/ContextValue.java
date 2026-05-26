package ru.mozhno.contexts;

import java.time.Instant;

public class ContextValue {
    private Integer id;
    private Integer contextDefinitionId;
    private String values;
    private Instant createdAt;

    public ContextValue() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getValues() { return values; }
    public void setValues(String values) { this.values = values; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}