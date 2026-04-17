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
import dev.mozhno.tags.TagAssembler;
import dev.mozhno.tags.TagService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/flags")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.tags.Tag(name = "Flags", description = "Feature flag management")
public class FlagController {
    private final FlagService flagService;
    private final FlagAssembler flagAssembler;
    private final SegmentService segmentService;
    private final TagService tagService;
    private final TagAssembler tagAssembler;
    private final ContextService contextService;
    private final ContextAssembler contextAssembler;
    private final EnvironmentService environmentService;
    private final EnvironmentAssembler environmentAssembler;

    @GetMapping
    @Operation(summary = "Get all flags for a project")
    @Timed(value = "flags.list", description = "Time to list flags")
    public Object getAll(@RequestParam(required = false) Integer environmentId,
                         @RequestParam(required = false, defaultValue = "false") boolean includeArchived,
                         @RequestParam(required = false, defaultValue = "0") int page,
                         @RequestParam(required = false, defaultValue = "50") int size,
                         @AuthenticationPrincipal UserPrincipal user) {
        if (page < 0) page = 0;
        if (size < 1) size = 50;
        if (size > 200) size = 200;

        Integer projectId = user.projectId();
        if (environmentId != null) {
            List<FlagWithStrategy> flags = flagService.findByProjectIdWithStrategyForEnvironment(projectId, environmentId);
            return flagAssembler.toResponses(flags);
        }
        PageResponse<Flag> pageResult = flagService.findByProjectIdPaginated(projectId, includeArchived, page, size);
        List<FlagResponse> items = pageResult.getItems().stream()
            .map(flagAssembler::toResponse)
            .toList();
        return new PageResponse<>(items, pageResult.getPage(), pageResult.getSize(), pageResult.getTotalItems());
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
    public Object getAllEnriched(@RequestParam(required = false, defaultValue = "0") int page,
                                  @RequestParam(required = false, defaultValue = "200") int size,
                                  @AuthenticationPrincipal UserPrincipal user) {
        if (page < 0) page = 0;
        if (size < 1) size = 200;
        if (size > 500) size = 500;

        Integer projectId = user.projectId();
        PageResponse<FlagWithStrategy> pageResult = flagService.findByProjectIdWithAllEnvironmentStrategiesPaginated(projectId, page, size);
        return new PaginatedDashboardResponse(
            flagAssembler.toEnrichedResponses(pageResult.getItems()),
            pageResult.getPage(), pageResult.getSize(), pageResult.getTotalItems(), pageResult.getTotalPages(),
            segmentService.findByProjectId(projectId),
            tagAssembler.toResponseList(tagService.findByProjectId(projectId)),
            contextAssembler.toDefinitionResponseList(contextService.findDefinitionsByProjectId(projectId)),
            environmentAssembler.toResponseList(environmentService.findByProjectId(projectId))
        );
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
}
