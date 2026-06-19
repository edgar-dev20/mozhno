package dev.mozhno;

/**
 * Supported data types for feature flag evaluation contexts.
 */
public enum ContextType {

    STRING("string"),
    NUMBER("number"),
    TIME("time"),
    SEMVER("semver");

    private final String value;

    ContextType(String value) {
        this.value = value;
    }

    /**
     * External representation used in request bodies and database columns.
     */
    public String getValue() {
        return value;
    }

    /**
     * Resolves a context type from its external string representation.
     * Returns {@link #STRING} for null or unknown values.
     */
    public static ContextType fromValue(String value) {
        if (value == null) return STRING;
        for (ContextType ct : values()) {
            if (ct.value.equals(value)) return ct;
        }
        return STRING;
    }
}
