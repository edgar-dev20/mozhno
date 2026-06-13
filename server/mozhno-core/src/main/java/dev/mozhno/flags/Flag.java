package dev.mozhno.flags;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * A feature flag entity that controls whether a feature is enabled or disabled.
 */
@Getter
@Setter
@NoArgsConstructor
public class Flag {
    private Integer id;
    private Integer projectId;
    private String name;
    private String key;
    private String description;
    private FlagType flagType;
    private Instant createdAt;
    private Integer creatorId;
    private Integer archivedBy;
    private Instant archivedAt;
    private boolean enabled;
    private boolean archived;
}