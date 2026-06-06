package ru.mozhno.segments;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.mozhno.auth.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/segments")
@RequiredArgsConstructor
@Tag(name = "Segments", description = "Custom segments with context-based targeting rules")
public class SegmentController {
    private final SegmentService segmentService;

    @GetMapping
    @Operation(summary = "Get all segments for a project")
    public List<SegmentResponse> getAll(@PathVariable Integer projectId,
                                        @AuthenticationPrincipal UserPrincipal user) {
        return segmentService.findByProjectId(projectId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get segment by ID")
    public SegmentResponse getById(@PathVariable Integer id,
                                   @AuthenticationPrincipal UserPrincipal user) {
        return segmentService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new segment")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public SegmentResponse create(@PathVariable Integer projectId, @Valid @RequestBody SegmentRequest request,
                                  @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(projectId);
        return segmentService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a segment")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public SegmentResponse update(@PathVariable Integer id, @Valid @RequestBody SegmentRequest request,
                                  @AuthenticationPrincipal UserPrincipal user) {
        return segmentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a segment")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        segmentService.delete(id);
    }
}