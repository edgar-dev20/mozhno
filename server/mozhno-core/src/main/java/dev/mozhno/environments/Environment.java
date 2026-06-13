package dev.mozhno.environments;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Represents a deployment environment (e.g. "production", "staging") within a project.
 */
@Getter
@Setter
@NoArgsConstructor
public class Environment {
    /** Unique identifier. */
    private Integer id;
    /** Environment name (e.g. "Production"). */
    private String name;
    /** Optional description. */
    private String description;
    /** Project this environment belongs to. */
    private Integer projectId;
    /** When the environment was created. */
    private Instant createdAt;
}
