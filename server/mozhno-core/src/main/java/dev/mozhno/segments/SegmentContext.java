package dev.mozhno.segments;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Join entity linking a segment to a context definition with an operator and values.
 */
@Getter
@Setter
@NoArgsConstructor
public class SegmentContext {
    private Integer id;
    private Integer segmentId;
    private Integer contextDefinitionId;
    private String contextValues;
    private String operator;
    private Instant createdAt;
}