package ru.mozhno.segments;

import lombok.Data;
import ru.mozhno.context.Context;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
public class Segment {

    private String name;
    private String description;
    private Instant createTime;
    private Map<Context, List<String>> context;

}