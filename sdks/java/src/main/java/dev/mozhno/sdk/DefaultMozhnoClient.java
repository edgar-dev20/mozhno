package dev.mozhno.sdk;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import dev.mozhno.sdk.model.FeatureFlag;
import dev.mozhno.sdk.repository.HttpFeatureFetcher;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

public class DefaultMozhnoClient implements MozhnoClient {
    private static final Logger log = LoggerFactory.getLogger(DefaultMozhnoClient.class);

    private final MozhnoConfig config;
    private final HttpFeatureFetcher fetcher;
    private final ConstraintEvaluator evaluator;
    private final List<EventListener> listeners;
    private final Map<String, FeatureFlag> flagCache;
    private final Map<String, long[]> metricsBuffer;
    private final ScheduledExecutorService scheduler;
    private final AtomicBoolean running;

    private ScheduledFuture<?> fetchFuture;
    private ScheduledFuture<?> metricsFuture;

    public DefaultMozhnoClient(MozhnoConfig config) {
        this.config = config;
        this.fetcher = new HttpFeatureFetcher(config);
        this.evaluator = new ConstraintEvaluator();
        this.listeners = new CopyOnWriteArrayList<>();
        this.flagCache = new ConcurrentHashMap<>();
        this.metricsBuffer = new ConcurrentHashMap<>();
        this.scheduler = Executors.newScheduledThreadPool(2, r -> {
            Thread t = new Thread(r, "mozhno-client");
            t.setDaemon(true);
            return t;
        });
        this.running = new AtomicBoolean(false);
    }

    @Override
    public void start() {
        if (!running.compareAndSet(false, true)) return;

        if (config.isSynchronousFetchOnInitialisation()) {
            fetchFlags();
        } else {
            scheduler.execute(this::fetchFlags);
        }

        if (config.getFetchTogglesInterval() > 0) {
            fetchFuture = scheduler.scheduleWithFixedDelay(
                this::fetchFlags,
                config.getFetchTogglesInterval(),
                config.getFetchTogglesInterval(),
                TimeUnit.SECONDS);
        }

        if (!config.isDisableMetrics() && config.getSendMetricsInterval() > 0) {
            metricsFuture = scheduler.scheduleWithFixedDelay(
                this::sendMetrics,
                config.getSendMetricsInterval(),
                config.getSendMetricsInterval(),
                TimeUnit.SECONDS);
        }

        log.info("Mozhno client started for app '{}'", config.getAppName());
    }

    @Override
    public void stop() {
        if (!running.compareAndSet(true, false)) return;

        sendMetrics();

        if (fetchFuture != null) fetchFuture.cancel(false);
        if (metricsFuture != null) metricsFuture.cancel(false);
        scheduler.shutdown();
        try {
            scheduler.awaitTermination(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        log.info("Mozhno client stopped for app '{}'", config.getAppName());
    }

    @Override
    public boolean isEnabled(String flagKey) {
        return isEnabled(flagKey, getContext(), false);
    }

    @Override
    public boolean isEnabled(String flagKey, boolean defaultReturn) {
        return isEnabled(flagKey, getContext(), defaultReturn);
    }

    @Override
    public boolean isEnabled(String flagKey, MozhnoContext context) {
        return isEnabled(flagKey, context, false);
    }

    @Override
    public boolean isEnabled(String flagKey, MozhnoContext context, boolean defaultReturn) {
        FeatureFlag flag = flagCache.get(flagKey);
        if (flag == null) {
            recordMetric(flagKey, defaultReturn);
            return defaultReturn;
        }

        MozhnoContext enriched = enrichContext(context);
        boolean enabled = evaluator.isEnabled(flag, enriched);
        recordMetric(flagKey, enabled);
        return enabled;
    }

    @Override
    public void addEventListener(EventListener listener) {
        listeners.add(listener);
    }

    private MozhnoContext getContext() {
        if (config.getContextProvider() != null) {
            return config.getContextProvider().getContext();
        }
        return MozhnoContext.builder().build();
    }

    private MozhnoContext enrichContext(MozhnoContext context) {
        if (context == null) context = getContext();
        if (context == null) context = MozhnoContext.builder().build();

        boolean needsAppName = context.getAppName() == null;
        boolean needsEnvironment = context.getEnvironment() == null;
        if (!needsAppName && !needsEnvironment) return context;

        var builder = MozhnoContext.builder();
        context.getProperties().forEach(builder::addProperty);
        if (needsAppName) builder.appName(config.getAppName());
        if (config.getEnvironment() != null && needsEnvironment) builder.environment(config.getEnvironment());
        return builder.build();
    }

    private void fetchFlags() {
        try {
            var result = fetcher.fetchFeatures();
            if (result.notModified()) return;

            if (result.flags() != null) {
                Map<String, FeatureFlag> newCache = new ConcurrentHashMap<>();
                for (FeatureFlag flag : result.flags()) {
                    newCache.put(flag.getKey(), flag);
                }
                flagCache.clear();
                flagCache.putAll(newCache);

                for (EventListener listener : listeners) {
                    try {
                        listener.onUpdate();
                    } catch (Exception e) {
                        log.debug("Listener error", e);
                    }
                }

                notifyReady();
            }
        } catch (Exception e) {
            log.error("Error fetching flags", e);
            for (EventListener listener : listeners) {
                try {
                    listener.onError(e);
                } catch (Exception ex) {
                    log.debug("Listener error", ex);
                }
            }
        }
    }

    private final AtomicBoolean readyNotified = new AtomicBoolean(false);
    private void notifyReady() {
        if (readyNotified.compareAndSet(false, true)) {
            for (EventListener listener : listeners) {
                try {
                    listener.onReady();
                } catch (Exception e) {
                    log.debug("Listener error", e);
                }
            }
        }
    }

    private void recordMetric(String flagKey, boolean enabled) {
        metricsBuffer.compute(flagKey, (k, v) -> {
            if (v == null) v = new long[2];
            if (enabled) v[0]++; else v[1]++;
            return v;
        });
    }

    private void sendMetrics() {
        if (metricsBuffer.isEmpty()) return;

        Map<String, long[]> snapshot = new HashMap<>(metricsBuffer);
        metricsBuffer.clear();

        Map<String, Map<String, Long>> payload = new HashMap<>();
        for (var entry : snapshot.entrySet()) {
            long[] counts = entry.getValue();
            payload.put(entry.getKey(), Map.of("t", counts[0], "f", counts[1]));
        }

        var result = fetcher.sendMetrics(payload);
        if (result != HttpFeatureFetcher.MetricsSendResult.SUCCESS) {
            for (var entry : snapshot.entrySet()) {
                metricsBuffer.merge(entry.getKey(), entry.getValue(), (a, b) -> {
                    b[0] += a[0];
                    b[1] += a[1];
                    return b;
                });
            }
        }
    }
}
