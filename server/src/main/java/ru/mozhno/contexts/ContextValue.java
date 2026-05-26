package ru.mozhno.contexts;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "context_values")
public class ContextValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "context_definition_id", nullable = false)
    private Integer contextDefinitionId;

    @Column(name = "context_values", nullable = false)
    private String values;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public ContextValue() {}

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getContextDefinitionId() { return contextDefinitionId; }
    public void setContextDefinitionId(Integer contextDefinitionId) { this.contextDefinitionId = contextDefinitionId; }
    public String getValues() { return values; }
    public void setValues(String values) { this.values = values; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}