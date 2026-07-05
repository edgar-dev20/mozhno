package dev.mozhno.metrics;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Records flag evaluation metrics asynchronously on the {@code metricsExecutor}
 * thread pool, keeping metric writes off the request-serving thread.
 *
 * <p>Lives in a dedicated bean (rather than a self-invoked method) so that the
 * {@code @Async} proxy is actually applied — self-invocation through
 * {@code this} would bypass the proxy and run synchronously.
 */
@Component
public class AsyncFlagMetricRecorder {

    private final FlagMetricRepository flagMetricRepository;

    public AsyncFlagMetricRecorder(FlagMetricRepository flagMetricRepository) {
        this.flagMetricRepository = flagMetricRepository;
    }

    @Async("metricsExecutor")
    public void recordEvaluation(Integer projectId, Integer flagId, Integer environmentId,
                                 boolean enabled, Long clientInstanceId) {
        flagMetricRepository.recordEvaluation(projectId, flagId, environmentId, enabled, clientInstanceId);
    }
}
