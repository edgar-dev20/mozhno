package dev.mozhno.contexts;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * The value(s) assigned to a context definition, used for targeting.
 */
@Getter
@Setter
@NoArgsConstructor
public class ContextValue {
    /** Unique identifier. */
    private Integer id;
    /** The context definition this value belongs to. */
    private Integer contextDefinitionId;
    /** Comma-separated list of allowed values. */
    private String values;
    /** When the context value was created. */
    private Instant createdAt;
}
