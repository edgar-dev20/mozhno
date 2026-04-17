package dev.mozhno.sdk;

import dev.mozhno.sdk.model.FeatureFlag;

import java.util.Collections;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class FakeMozhnoClient implements MozhnoClient {
    private final ConcurrentMap<String, FeatureFlag> flags = new ConcurrentHashMap<>();
    private final ConstraintEvaluator evaluator = new ConstraintEvaluator();
    private boolean allEnabled = false;

    @Override
    public void start() {}

    @Override
    public void stop() {}

    public void enableAll() {
        allEnabled = true;
    }

    public void enable(String... flagKeys) {
        for (String key : flagKeys) {
            FeatureFlag flag = new FeatureFlag();
            flag.setKey(key);
            flag.setName(key);
            flag.setEnabled(true);
            flags.put(key, flag);
        }
    }

    public void disable(String... flagKeys) {
        for (String key : flagKeys) {
            flags.remove(key);
        }
    }

    public void addFlag(FeatureFlag flag) {
        flags.put(flag.getKey(), flag);
    }

    public void clear() {
        flags.clear();
        allEnabled = false;
    }

    @Override
    public boolean isEnabled(String flagKey) {
        return isEnabled(flagKey, MozhnoContext.builder().build(), false);
    }

    @Override
    public boolean isEnabled(String flagKey, boolean defaultReturn) {
        return isEnabled(flagKey, MozhnoContext.builder().build(), defaultReturn);
    }

    @Override
    public boolean isEnabled(String flagKey, MozhnoContext context) {
        return isEnabled(flagKey, context, true);
    }

    @Override
    public boolean isEnabled(String flagKey, MozhnoContext context, boolean defaultReturn) {
        if (allEnabled) return true;

        FeatureFlag flag = flags.get(flagKey);
        if (flag == null) return defaultReturn;

        return evaluator.isEnabled(flag, context);
    }

    @Override
    public void addEventListener(EventListener listener) {}
}
