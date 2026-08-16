package dev.mozhno.segments;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.auth.UserPrincipal;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/segments")
@RequiredArgsConstructor
@Tag(name = "Segments", description = "Custom segments with context-based targeting rules")
public class SegmentController {
    private final SegmentService segmentService;
    private final SegmentAssembler segmentAssembler;

    @GetMapping
    @Operation(summary = "Get all segments for a project")
    public List<SegmentResponse> getAll(@AuthenticationPrincipal UserPrincipal user) {
        List<Segment> segments = segmentService.findByProjectId(user.projectId());
        List<Integer> segmentIds = segments.stream().map(Segment::getId).toList();
        List<SegmentContextRepository.SegmentContextWithName> contexts =
            segmentService.getContextsForSegments(segmentIds);
        Map<Integer, Integer> flagCounts = segmentService.countFlagsBySegments(segmentIds);
        return segmentAssembler.toResponseList(segments, contexts, flagCounts);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get segment by ID")
    public SegmentResponse getById(@PathVariable Integer id,
                                   @AuthenticationPrincipal UserPrincipal user) {
        Segment segment = segmentService.findById(id, user.projectId());
        List<SegmentContextRepository.SegmentContextWithName> contexts =
            segmentService.getContextsForSegments(List.of(id));
        return segmentAssembler.toResponse(segment, contexts, id, countFlags(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new segment")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER')")
    public SegmentResponse create(@Valid @RequestBody SegmentRequest request,
                                  @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        Segment segment = segmentService.create(request);
        List<SegmentContextRepository.SegmentContextWithName> contexts =
            segmentService.getContextsForSegments(List.of(segment.getId()));
        return segmentAssembler.toResponse(segment, contexts, segment.getId(), 0);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a segment")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER')")
    public SegmentResponse update(@PathVariable Integer id,
                                  @Valid @RequestBody SegmentRequest request,
                                  @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        Segment segment = segmentService.update(id, request);
        List<SegmentContextRepository.SegmentContextWithName> contexts =
            segmentService.getContextsForSegments(List.of(segment.getId()));
        return segmentAssembler.toResponse(segment, contexts, segment.getId(), countFlags(id));
    }

    private int countFlags(Integer segmentId) {
        return segmentService.countFlagsBySegments(List.of(segmentId)).getOrDefault(segmentId, 0);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a segment")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        segmentService.delete(id, user.projectId());
    }
}
