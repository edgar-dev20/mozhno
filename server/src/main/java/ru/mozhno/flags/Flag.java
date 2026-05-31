package ru.mozhno.flags;

import ru.mozhno.flags.strategy.FlagStrategy;
import java.time.Instant;

public class Flag {
    private Integer id;
    private Integer projectId;
    private String name;
    private String key;
    private String description;
    private FlagType flagType;
    private Instant createdAt;
    private FlagStrategy strategy;

    public Flag() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public FlagType getFlagType() { return flagType; }
    public void setFlagType(FlagType flagType) { this.flagType = flagType; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public FlagStrategy getStrategy() { return strategy; }
    public void setStrategy(FlagStrategy strategy) { this.strategy = strategy; }
}