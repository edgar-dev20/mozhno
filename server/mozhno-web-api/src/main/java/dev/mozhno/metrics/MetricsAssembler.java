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

    public FlagContributorResponse toContributorResponse(FlagContributor contributor) {
        return FlagContributorResponse.builder()
            .instanceId(contributor.instanceId())
            .sdkInstanceId(contributor.sdkInstanceId())
            .appName(contributor.appName())
            .appType(contributor.appType())
            .sdkVersion(contributor.sdkVersion())
            .lastSeenAt(contributor.lastSeenAt())
            .evaluationTrueCount(contributor.evaluationTrueCount())
            .evaluationFalseCount(contributor.evaluationFalseCount())
            .build();
    }

    public List<FlagContributorResponse> toContributorResponseList(List<FlagContributor> contributors) {
        return contributors.stream().map(this::toContributorResponse).toList();
    }
}
