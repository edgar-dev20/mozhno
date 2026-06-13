package dev.mozhno.sdk;

public interface EventListener {
    enum Event { READY, UPDATE, ERROR }

    void onReady();
    default void onUpdate() {}
    default void onError(Exception error) {}
}
