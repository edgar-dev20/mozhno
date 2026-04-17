package dev.mozhno.sdk;

public interface MozhnoClient {
    void start();
    void stop();

    /** Returns false if flag not found (fail-closed). */
    boolean isEnabled(String flagKey);

    /** Uses the provided default when flag is not found. */
    boolean isEnabled(String flagKey, boolean defaultReturn);

    /** Returns false if flag not found (fail-closed). */
    boolean isEnabled(String flagKey, MozhnoContext context);

    /** Uses the provided default when flag is not found. */
    boolean isEnabled(String flagKey, MozhnoContext context, boolean defaultReturn);

    void addEventListener(EventListener listener);
}
