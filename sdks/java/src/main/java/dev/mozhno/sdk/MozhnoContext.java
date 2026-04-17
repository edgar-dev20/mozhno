package dev.mozhno.sdk;

import java.util.LinkedHashMap;
import java.util.Map;

public class MozhnoContext {
    private final Map<String, String> properties;

    private MozhnoContext(Builder builder) {
        this.properties = new LinkedHashMap<>(builder.properties);
    }

    public Map<String, String> getProperties() {
        return properties;
    }

    public String getUserId() {
        return properties.get("userId");
    }

    public String getSessionId() {
        return properties.get("sessionId");
    }

    public String getEnvironment() {
        return properties.get("environment");
    }

    public String getAppName() {
        return properties.get("appName");
    }

    public String getProperty(String key) {
        return properties.get(key);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Map<String, String> properties = new LinkedHashMap<>();

        public Builder userId(String userId) {
            properties.put("userId", userId);
            return this;
        }

        public Builder sessionId(String sessionId) {
            properties.put("sessionId", sessionId);
            return this;
        }

        public Builder environment(String environment) {
            properties.put("environment", environment);
            return this;
        }

        public Builder appName(String appName) {
            properties.put("appName", appName);
            return this;
        }

        public Builder addProperty(String key, String value) {
            properties.put(key, value);
            return this;
        }

        public MozhnoContext build() {
            return new MozhnoContext(this);
        }
    }
}
