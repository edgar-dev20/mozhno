package ru.mozhno.metrics;

import java.time.Instant;

public class FlagMetric {
    private Long id;
    private Integer projectId;
    private Integer flagId;
    private Integer environmentId;
    private long evaluationTrueCount;
    private long evaluationFalseCount;
    private Instant timeBucket;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getProjectId() { return projectId; }
    public void setProjectId(Integer projectId) { this.projectId = projectId; }
    public Integer getFlagId() { return flagId; }
    public void setFlagId(Integer flagId) { this.flagId = flagId; }
    public Integer getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(Integer environmentId) { this.environmentId = environmentId; }
    public long getEvaluationTrueCount() { return evaluationTrueCount; }
    public void setEvaluationTrueCount(long evaluationTrueCount) { this.evaluationTrueCount = evaluationTrueCount; }
    public long getEvaluationFalseCount() { return evaluationFalseCount; }
    public void setEvaluationFalseCount(long evaluationFalseCount) { this.evaluationFalseCount = evaluationFalseCount; }
    public Instant getTimeBucket() { return timeBucket; }
    public void setTimeBucket(Instant timeBucket) { this.timeBucket = timeBucket; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
