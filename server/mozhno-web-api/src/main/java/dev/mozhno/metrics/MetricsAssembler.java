package dev.mozhno.metrics;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MetricsAssembler {

    public FlagMetricResponse toResponse(FlagMetric metric) {
        return FlagMetricResponse.builder()
            .id(metric.getId())
            .projectId(metric.getProjectId())
            .flagId(metric.getFlagId())
            .environmentId(metric.getEnvironmentId())
            .evaluationTrueCount(metric.getEvaluationTrueCount())
            .evaluationFalseCount(metric.getEvaluationFalseCount())
            .clientInstanceId(metric.getClientInstanceId())
            .timeBucket(metric.getTimeBucket())
            .createdAt(metric.getCreatedAt())
            .build();
    }

    public List<FlagMetricResponse> toResponseList(List<FlagMetric> metrics) {
        return metrics.stream().map(this::toResponse).toList();
    }
}
