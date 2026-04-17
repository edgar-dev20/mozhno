package dev.mozhno.tags;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * A tag used to categorize and organize flags.
 */
@Getter
@Setter
@NoArgsConstructor
public class Tag {
    /** Unique identifier. */
    private Integer id;
    /** Tag name. */
    private String name;
    /** Optional description. */
    private String description;
    /** Color hex code for display. */
    private String color;
    /** Project this tag belongs to. */
    private Integer projectId;
    /** When the tag was created. */
    private Instant createdAt;
}
