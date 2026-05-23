package ru.mozhno.contexts;

public class ContextValueRequest {
    private Integer contextDefinitionId;
    private String values;

    public ContextValueRequest() {}

    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getValues() { return values; }
    public void setValues(String values) { this.values = values; }
}