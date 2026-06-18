package dev.mozhno.flags;

import io.swagger.v3.oas.annotations.Operation;
import io.micrometer.core.annotation.Timed;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import dev.mozhno.common.PageResponse;
import dev.mozhno.auth.UserPrincipal;
import dev.mozhno.contexts.ContextAssembler;
import dev.mozhno.contexts.ContextService;
import dev.mozhno.environments.EnvironmentAssembler;
import dev.mozhno.environments.EnvironmentService;
import dev.mozhno.segments.SegmentService;
import dev.mozhno.segments.SegmentAssembler;
import dev.mozhno.segments.Segment;
import dev.mozhno.tags.TagAssembler;
import dev.mozhno.tags.TagService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/flags")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Flags", description = "Feature flag management")
public class FlagController {

    private static final int DEFAULT_PAGE_SIZE = 50;
    private static final int MAX_PAGE_SIZE = 200;
    private static final int ENRICHED_MAX_PAGE_SIZE = 500;

    private final FlagService flagService;
    private final FlagAssembler flagAssembler;
    private final SegmentService segmentService;
    private final SegmentAssembler segmentAssembler;
    private final TagService tagService;
    private final TagAssembler tagAssembler;
    private final ContextService contextService;
    private final ContextAssembler contextAssembler;
    private final EnvironmentService environmentService;
    private final EnvironmentAssembler environmentAssembler;

    @GetMapping
    @Operation(summary = "Get all flags for a project (paginated)")
    @Timed(value = "flags.list", description = "Time to list flags")
    public PageResponse<FlagResponse> getAll(
            @RequestParam(required = false, defaultValue = "false") boolean includeArchived,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal user) {
        page = Math.max(page, 0);
        size = clamp(size, 1, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

        PageResponse<Flag> pageResult = flagService.findByProjectIdPaginated(user.projectId(), includeArchived, page, size);
        List<FlagResponse> items = pageResult.getItems().stream()
            .map(flagAssembler::toResponse)
            .toList();
        return new PageResponse<>(items, pageResult.getPage(), pageResult.getSize(), pageResult.getTotalItems());
    }

    @GetMapping("/by-environment")
    @Operation(summary = "Get all flags for a project, filtered by environment")
    @Timed(value = "flags.list.byEnv", description = "Time to list flags by environment")
    public List<FlagResponse> getByEnvironment(
            @RequestParam Integer environmentId,
            @AuthenticationPrincipal UserPrincipal user) {
        List<FlagWithStrategy> flags = flagService.findByProjectIdWithStrategyForEnvironment(user.projectId(), environmentId);
        return flagAssembler.toResponses(flags);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get flag by ID")
    public FlagResponse getById(@PathVariable Integer id,
                                @AuthenticationPrincipal UserPrincipal user) {
        Flag flag = flagService.findById(id, user.projectId());
        return flagAssembler.toResponse(flag);
    }

    @GetMapping("/enriched")
    @Operation(summary = "Get all flags with environments, segments, tags, contexts in a single request")
    public PaginatedDashboardResponse getAllEnriched(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "200") int size,
            @AuthenticationPrincipal UserPrincipal user) {
        page = Math.max(page, 0);
        size = clamp(size, 1, DEFAULT_PAGE_SIZE, ENRICHED_MAX_PAGE_SIZE);

        Integer projectId = user.projectId();
        PageResponse<FlagWithStrategy> pageResult = flagService.findByProjectIdWithAllEnvironmentStrategiesPaginated(projectId, page, size);
        List<Segment> segments = segmentService.findByProjectId(projectId);
        List<Integer> segmentIds = segments.stream().map(Segment::getId).toList();
        return PaginatedDashboardResponse.builder()
            .flags(flagAssembler.toEnrichedResponses(pageResult.getItems()))
            .page(pageResult.getPage())
            .size(pageResult.getSize())
            .totalItems(pageResult.getTotalItems())
            .totalPages(pageResult.getTotalPages())
            .segments(segmentAssembler.toResponseList(segments, segmentService.getContextsForSegments(segmentIds)))
            .tags(tagAssembler.toResponseList(tagService.findByProjectId(projectId)))
            .contexts(contextAssembler.toDefinitionResponseList(contextService.findDefinitionsByProjectId(projectId)))
            .environments(environmentAssembler.toResponseList(environmentService.findByProjectId(projectId)))
            .build();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    @Timed(value = "flags.create", description = "Time to create a flag")
    public FlagResponse create(@Valid @RequestBody FlagRequest request,
                               @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        Flag flag = flagService.create(request, user.userId());
        return flagAssembler.toResponse(flag);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    @Timed(value = "flags.update", description = "Time to update a flag")
    public FlagResponse update(@PathVariable Integer id,
                               @Valid @RequestBody FlagRequest request,
                               @AuthenticationPrincipal UserPrincipal user) {
        request.setProjectId(user.projectId());
        Flag flag = flagService.update(id, request);
        return flagAssembler.toResponse(flag);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public void delete(@PathVariable Integer id,
                       @AuthenticationPrincipal UserPrincipal user) {
        flagService.delete(id, user.projectId());
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive a flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public FlagResponse archive(@PathVariable Integer id,
                                @AuthenticationPrincipal UserPrincipal user) {
        Flag flag = flagService.archive(id, user.userId(), user.projectId());
        return flagAssembler.toResponse(flag);
    }

    @PostMapping("/{id}/unarchive")
    @Operation(summary = "Unarchive a flag")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER', 'EDITOR')")
    public FlagResponse unarchive(@PathVariable Integer id,
                                  @AuthenticationPrincipal UserPrincipal user) {
        Flag flag = flagService.unarchive(id, user.projectId());
        return flagAssembler.toResponse(flag);
    }

    private static int clamp(int value, int min, int defaultValue, int max) {
        if (value < min) return defaultValue;
        if (value > max) return max;
        return value;
    }
}
