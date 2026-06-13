package dev.mozhno.segments;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * A user segment defined by context-based targeting rules.
 */
@Getter
@Setter
@NoArgsConstructor
public class Segment {
    /** Unique identifier. */
    private Integer id;
    /** Project this segment belongs to. */
    private Integer projectId;
    /** Segment name. */
    private String name;
    /** Optional description. */
    private String description;
    /** Icon identifier (e.g. "Users", "Globe"). */
    private String icon = "Users";
    /** Color hex code. */
    private String color = "#3b82f1";
    /** When the segment was created. */
    private Instant createdAt;
}
