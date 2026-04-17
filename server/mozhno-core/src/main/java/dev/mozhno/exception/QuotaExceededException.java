package dev.mozhno.exception;

/**
 * Thrown when a quota or plan limit is exceeded.
 * Maps to HTTP 402 (Payment Required).
 */
public class QuotaExceededException extends MozhnoException {

    private final int current;
    private final int limit;
    private final String planName;

    public QuotaExceededException(int current, int limit, String planName) {
        super("QUOTA_EXCEEDED",
            "Flag limit reached: %d/%d (%s plan). Upgrade to create more."
                .formatted(current, limit, planName != null && !planName.isBlank() ? planName : "current"));
        this.current = current;
        this.limit = limit;
        this.planName = planName != null && !planName.isBlank() ? planName : "current";
    }

    public int getCurrent() { return current; }
    public int getLimit() { return limit; }
    public String getPlanName() { return planName; }
}
