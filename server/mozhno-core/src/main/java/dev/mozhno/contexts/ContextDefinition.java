package dev.mozhno.contexts;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * A context definition that describes a targeting attribute (e.g. "country", "plan").
 */
@Getter
@Setter
@NoArgsConstructor
public class ContextDefinition {
    /** Unique identifier. */
    private Integer id;
    /** Human-readable name (e.g. "Country"). */
    private String name;
    /** Machine-friendly key used in SDKs (e.g. "country"). */
    @JsonProperty("key")
    private String contextKey;
    /** Data type of the context value (e.g. "string", "number"). Defaults to "string". */
    @JsonProperty("type")
    private String contextType;
    /** Username of the creator. */
    private String createdBy;
    /** Optional description. */
    private String description;
    /** Whether the context enforces a whitelist of allowed values. */
    private boolean isStrict;
    /** Project this context belongs to. */
    private Integer projectId;
    /** When the context definition was created. */
    private Instant createdAt;
}
