package dev.mozhno;

/**
 * Supported constraint operators for feature flag evaluation contexts and segment
 * targeting rules.
 *
 * <p>{@link #IN} and {@link #NOT_IN} accept multiple comma-separated values; all
 * other operators are single-value.
 */
public enum Operator {

    IN("in", true),
    NOT_IN("not_in", true),
    EQ("eq", false),
    NE("ne", false),
    GT("gt", false),
    GTE("gte", false),
    LT("lt", false),
    LTE("lte", false),
    CONTAINS("contains", false);

    private final String value;
    private final boolean multi;

    Operator(String value, boolean multi) {
        this.value = value;
        this.multi = multi;
    }

    /**
     * External representation used in request bodies and database columns.
     */
    public String getValue() {
        return value;
    }

    /**
     * Whether this operator accepts multiple comma-separated values.
     */
    public boolean isMulti() {
        return multi;
    }

    /**
     * Checks whether the given operator string represents a multi-value operator.
     */
    public static boolean isMulti(String operator) {
        return IN.value.equals(operator) || NOT_IN.value.equals(operator);
    }

    /**
     * Resolves an operator from its external string representation.
     * Returns {@code null} for unknown or null values.
     */
    public static Operator fromValue(String value) {
        if (value == null) return null;
        for (Operator op : values()) {
            if (op.value.equals(value)) return op;
        }
        return null;
    }
}
