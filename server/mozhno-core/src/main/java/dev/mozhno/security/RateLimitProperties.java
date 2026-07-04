package dev.mozhno.security;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "mozhno.security.rate-limit")
public class RateLimitProperties {

    private boolean enabled = true;

    private final Bucket login = new Bucket(10, 10, 1);
    private final Bucket passwordReset = new Bucket(3, 3, 60);
    private final Bucket refresh = new Bucket(10, 10, 1);
    private final Bucket client = new Bucket(1000, 1000, 1);
    private final Bucket apiWrite = new Bucket(100, 100, 1);

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public Bucket getLogin() { return login; }
    public Bucket getPasswordReset() { return passwordReset; }
    public Bucket getRefresh() { return refresh; }
    public Bucket getClient() { return client; }
    public Bucket getApiWrite() { return apiWrite; }

    public static class Bucket {
        @Min(1)
        private int capacity;
        @Min(1)
        private int refillTokens;
        @Min(1)
        private int refillMinutes;

        public Bucket() {}
        public Bucket(int capacity, int refillTokens, int refillMinutes) {
            this.capacity = capacity;
            this.refillTokens = refillTokens;
            this.refillMinutes = refillMinutes;
        }

        public int getCapacity() { return capacity; }
        public void setCapacity(int capacity) { this.capacity = capacity; }
        public int getRefillTokens() { return refillTokens; }
        public void setRefillTokens(int refillTokens) { this.refillTokens = refillTokens; }
        public int getRefillMinutes() { return refillMinutes; }
        public void setRefillMinutes(int refillMinutes) { this.refillMinutes = refillMinutes; }
    }
}
