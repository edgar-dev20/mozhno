package dev.mozhno.flags;

import dev.mozhno.flags.strategy.FlagStrategy;

/**
 * Projection record that pairs a {@link Flag} domain entity with its optional
 * {@link FlagStrategy} for a specific environment. Separates the query-result
 * concern from the entity, avoiding transient fields on the domain model.
 */
public record FlagWithStrategy(Flag flag, FlagStrategy strategy) {

    public boolean isEnabled() {
        return strategy != null ? strategy.isEnabled() : flag.isEnabled();
    }
}
