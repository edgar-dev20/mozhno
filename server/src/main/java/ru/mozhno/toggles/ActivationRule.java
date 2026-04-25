package ru.mozhno.toggles;

import lombok.Data;
import ru.mozhno.segments.Segment;

import java.util.List;

@Data
public class ActivationRule {

    public enum SegmentRelation {
        AND,
        OR
    }

    private boolean enabled;
    private SegmentRelation segmentRelation;
    private List<Segment> segments;
    private Double rolloutPercentage;

}