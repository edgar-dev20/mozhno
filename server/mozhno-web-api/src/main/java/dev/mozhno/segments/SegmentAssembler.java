package dev.mozhno.segments;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class SegmentAssembler {

    public SegmentResponse toResponse(Segment segment) {
        return toResponse(segment, Collections.emptyList());
    }

    public SegmentResponse toResponse(Segment segment, List<SegmentContextRepository.SegmentContextWithName> allContexts,
                                       Integer segmentId) {
        List<SegmentResponse.ContextEntryResponse> entries = allContexts.stream()
            .filter(ctx -> ctx.getSegmentId().equals(segmentId))
            .map(ctx -> SegmentResponse.ContextEntryResponse.builder()
                .contextDefinitionId(ctx.getContextDefinitionId())
                .operator(ctx.getOperator())
                .contextValues(ctx.getContextValues())
                .build())
            .toList();
        return toResponse(segment, entries);
    }

    public List<SegmentResponse> toResponseList(List<Segment> segments,
                                                  List<SegmentContextRepository.SegmentContextWithName> allContexts) {
        Map<Integer, List<SegmentResponse.ContextEntryResponse>> contextMap = new LinkedHashMap<>();
        for (SegmentContextRepository.SegmentContextWithName ctx : allContexts) {
            SegmentResponse.ContextEntryResponse ce = SegmentResponse.ContextEntryResponse.builder()
                .contextDefinitionId(ctx.getContextDefinitionId())
                .operator(ctx.getOperator())
                .contextValues(ctx.getContextValues())
                .build();
            contextMap.computeIfAbsent(ctx.getSegmentId(), k -> new ArrayList<>()).add(ce);
        }

        List<SegmentResponse> responses = new ArrayList<>();
        for (Segment s : segments) {
            responses.add(toResponse(s, contextMap.getOrDefault(s.getId(), Collections.emptyList())));
        }
        return responses;
    }

    private SegmentResponse toResponse(Segment segment, List<SegmentResponse.ContextEntryResponse> contextEntries) {
        return SegmentResponse.builder()
            .id(segment.getId())
            .projectId(segment.getProjectId())
            .name(segment.getName())
            .description(segment.getDescription())
            .icon(segment.getIcon())
            .color(segment.getColor())
            .createdAt(segment.getCreatedAt())
            .context(contextEntries)
            .build();
    }
}
