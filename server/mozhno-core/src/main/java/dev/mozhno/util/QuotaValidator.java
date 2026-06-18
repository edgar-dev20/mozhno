package dev.mozhno.util;

import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.exception.QuotaExceededException;

public final class QuotaValidator {

    private QuotaValidator() {
    }

    public static void check(QuotaSpi.QuotaResult result) {
        if (result == null) {
            throw new QuotaExceededException(0, 0, "unknown");
        }
        if (result instanceof QuotaSpi.Blocked blocked) {
            throw new QuotaExceededException(blocked.current(), blocked.limit(), blocked.planName());
        }
    }
}
