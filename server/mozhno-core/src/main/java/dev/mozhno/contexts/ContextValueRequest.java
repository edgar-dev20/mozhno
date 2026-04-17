package dev.mozhno.contexts;

import jakarta.validation.constraints.Size;

/**
 * Request body for creating or updating a context value.
 */
public class ContextValueRequest {
    /** The context definition ID. */
    private Integer contextDefinitionId;
    /** Comma-separated list of allowed values. */
    @Size(max = 10000) private String values;

    public ContextValueRequest() {}

    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getValues() { return values; }
    public void setValues(String values) { this.values = values; }
}